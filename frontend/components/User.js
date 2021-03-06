// CUSTOM RENDER PROP
import { Query } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";

// Query to grab the current user
const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY{
    currentUser{
      id
      email
      name
      permissions
    }
  }
`;

const User = props => (
  //props allow for addiontal passing of arguments
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
);

User.propTypes = {
  children: PropTypes.func.isRequired
}

export default User;
export { CURRENT_USER_QUERY };