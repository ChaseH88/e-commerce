const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

// For Email
const { transport, makeAnEmail } = require("../mail");

// token expiry time
const tokenTime = 1000 * 60 * 60 * 24 * 365;

const Mutations = {

  // CREATE ITEM
  async createItem(parent, args, ctx, info){
    // Check if logged in
    if(!ctx.request.userId){
      throw new Error("You must be logged in to create an item.")
    }


    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // create relationship to item
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      }, info );
      return item
    },
    
    // UPDATE ITEM
    updateItem(parent, args, ctx, info){
      const updates = { ...args };
      //remove the id from the arguments
      delete updates.id;
      //run the update method
      return ctx.db.mutation.updateItem({
        data: updates,
        where: {
          id: args.id
        },
        info
      });
    }, 

    // DELETE ITEM
    async deleteItem(parent, args, ctx, info){
      const where = { id: args.id };
      // find the item
      const item = await ctx.db.query.item({ where }, `{id title}`)
      // check if they have permissions
      //##########
      // delete the item
      return ctx.db.mutation.deleteItem({ where }, info);
    },

    // SIGNUP
    async signup(parent, args, ctx, info){
      args.email = args.email.toLowerCase();
      //hash the password
      const password = await bcrypt.hash(args.password, 11);
      //create the user
      const user = await ctx.db.mutation.createUser({
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] } //reference the ENUM
        }
      }, info); //info is returned to the client
      // generate the JWT for the new user
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      //set the cookie and send the response
      ctx.response.cookie("token", token, {
        httpOnly: true, //prevents JS from accessing the cookie
        maxAge: tokenTime // set the life span of the cookie
      });
      // return the user to the browser
      return user;
    },

    // SIGN-IN
    async signin(parent, { email, password }, ctx, info){
      //check if user exist
      const user = await ctx.db.query.user({ where: { email }});
      if(!user){
        throw new Error(`No account exist for ${email}`);
      }
      //check if password is correct
      const valid = await bcrypt.compare(password, user.password);
      if(!valid) {
        throw new Error("Invalid Password");
      }
      //generate the JWT
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      //set the cookie
      ctx.response.cookie("token", token, {
        httpOnly: true, //prevents JS from accessing the cookie
        maxAge: tokenTime // set the life span of the cookie
      });
      //return the user
      return user;
    },

    // SIGN-OUT
    signout(parent, args, ctx, info){
      ctx.response.clearCookie("token");
      return { message: "You have signed out." }
    },

    // REQUEST PASSWORD RESET
    async requestReset(parent, args, ctx, info){
      // check if the email exist
      const user = await ctx.db.query.user({
        where: { email: args.email }
      });
      if(!user){
        throw new Error(`No account exist for ${args.email}`);
      }
      // set a reset token and expiry time
      const randomBytesPromise = promisify(randomBytes);
      const resetToken = (await randomBytesPromise(20)).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000;
      const res = await ctx.db.mutation.updateUser({
        where: { email: args.email },
        data: { resetToken, resetTokenExpiry}
      });
      
      // email the token to the user
      const mailRes = await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Your Password Reset Token",
        html: makeAnEmail(`Here is your password reset token \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset Your Password</a>`)
      });
      // return the message
      return { message: "You have requested a reset password token." }
    },

    // PASSWORD RESET LOGIC
    async resetPassword(parent, args, ctx, info) {
      // 1. check if the passwords match
      if (args.password !== args.confirmPassword) {
        throw new Error("Yo Passwords don't match!");
      }
      // 2. check if its a legit reset token
      // 3. Check if its expired
      const [user] = await ctx.db.query.users({
        where: {
          resetToken: args.resetToken,
          resetTokenExpiry_gte: Date.now() - 3600000,
        },
      });
      if (!user) {
        throw new Error('This token is either invalid or expired!');
      }
      // 4. Hash their new password
      const password = await bcrypt.hash(args.password, 10);
      // 5. Save the new password to the user and remove old resetToken fields
      const updatedUser = await ctx.db.mutation.updateUser({
        where: { email: user.email },
        data: {
          password,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
      // 6. Generate JWT
      const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
      // 7. Set the JWT cookie
      ctx.response.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      // 8. return the new user
      return updatedUser;
    }
};

module.exports = Mutations;
