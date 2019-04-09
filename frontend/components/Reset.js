import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";

// Styled Component
import Form from "./styles/Form";
import Error from "./ErrorMessage";

// Queries
import { CURRENT_USER_QUERY } from "../components/User";

// Mutation
const RESET_MUTATION = gql`
  mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!){
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword){
      id
      email
      name
    }
  }
`

class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  }
  state = {
    password: "",
    confirmPassword: ""
  }

  // Update the state on user input
  saveToState = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render(){
    return(
      <Mutation mutation={RESET_MUTATION} variables={{
        // reset token is brought in from the url
        resetToken: this.props.resetToken,
        password: this.state.password,
        confirmPassword: this.state.confirmPassword
      }} refetchQueries={[{
        query: CURRENT_USER_QUERY
      }]}>
        {(reset, { error, loading, called }) => {
      return (<Form method="POST" onSubmit={async e =>{
        e.preventDefault();
        const res = await reset();
        console.log(res);
        this.setState({
          password: "",
          confirmPassword: ""
        })
      }}>
        <fieldset disabled={loading} aria-busy={loading}>
        <Error error={error} />
          <h2>Reset Your Password</h2>
          <label htmlFor="password">
            Enter New Password
            <input type="password" name="password" placeholder="Enter Password" value={this.state.password} onChange={this.saveToState} />
          </label>
          <label htmlFor="password">
            Confirm New Password
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.saveToState} />
          </label>
          <button type="submit">Reset Password</button>
        </fieldset>
      </Form>)
      }}
      </Mutation>
    )
  }
}

export default Reset;