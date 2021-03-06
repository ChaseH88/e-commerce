import Nav from "./Nav";
import Link from "next/link";
import styled from "styled-components";

// Link that changes the page
import Router from "next/router";
// Progress bar
import NProgress from "nprogress";
// Router config
Router.onRouteChangeStart = () => { NProgress.start() };
Router.onRouteChangeComplete = () => { NProgress.done() };
Router.onRouteChangeError = () => { NProgress.done() };

// Utilities
import { SiteName } from "../config";

// Props are passed down from the main page component
const Logo = styled.h1`
  font-size: 2em;
  margin: 0 0 0 2rem;
  position: realtive;
  z-index: 2;
  transform: skew(-7deg);
  a {
    padding: 0.5em 1em;
    background: ${props => props.theme.red};
    color: #fff;
    text-transform: uppercase;
    text-decoration: none;
  }
  @media screen and (max-width: 1300px){
    margin: 0;
    text-align: center;
  }
`;

const StyledHeader = styled.header`
  .bar {
    border-bottom: 10px solid ${props => props.theme.black};
    display: grid;
    grid-template-columns: auto 1fr;
    justify-content: space-between;
    align-items: stretch;
    @media screen and (max-width: 1300px){
      grid-template-columns: 1fr;
      justify-content: center;
    }
  }
  .sub-bar {
      display: grid;
      grid-template-columns: 1fr auto;
      border-bottom: 1px solid ${props => props.theme.lightgrey};
    }
`

const Header = () => (
  <StyledHeader>
    <div className="bar">
    <Logo>
      <Link href="/">
        <a>{SiteName}</a>
      </Link>
    </Logo>
      <Nav />
    </div>
    <div className="sub-bar">
      <p>Search</p>
    </div>
    <div>
      Cart
    </div>
  </StyledHeader>
)

export default Header;