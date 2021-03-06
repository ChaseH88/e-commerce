import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Head from "next/head";
import Link from "next/link";

// Utilities
import { SiteNameMeta, perPage } from "../config";

// Styled Components
import PaginationStyles from "./styles/PaginationStyles";

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
    <Query query={PAGINATION_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <p>Loading...</p>;
        const { count } = data.itemsConnection.aggregate,
              pages = Math.ceil(count / perPage),
              page = props.page
        return(
          <PaginationStyles>
            <Head>
              <title>{SiteNameMeta} | Page {page} of {pages}</title>
            </Head>

            {/* Previous Button */}
            <Link prefetch href={{
              pathname: "items",
              query: { page: page - 1}
            }}><a className="prev" aria-disabled={page <= 1}> Prev</a></Link>

            {/* Next Button */}
            <Link prefetch href={{
              pathname: "items",
              query: { page: page + 1}
            }}><a className="next" aria-disabled={page >= pages}> Next</a></Link>

            <p>Page {props.page} of {pages}</p>
            <p>Total Items: {count}</p>
          </PaginationStyles>
        );
      }}
    </Query>
);

export default Pagination;