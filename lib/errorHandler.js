export const errorHandler = ({ graphQLErrors, networkError }) => {
  let message = "";
  if (graphQLErrors) {
    graphQLErrors.map((item) => {
      message += item.message;
      return null;
    });
    return message;
  }

  if (networkError) {
    return "Network error!, check network and try again";
  }
};
