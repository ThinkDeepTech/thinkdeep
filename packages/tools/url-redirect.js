/**
 * Middleware providing redirection to original page.
 *
 * NOTE: This is necessary because Auth0 doesn't allow wildcard urls to be added
 * to the list of allowed redirects. Because @web/test-runner dynamically assigns
 * urls this is an issue.
 *
 * @param {Object} context Request context containing data such as the request method, url, etc.
 * @param {Function} next Standard middleware next function for moving onto the next unit of middleware.
 */
const urlRedirect = (context, next) => {
  console.log(JSON.stringify(context));
  next();
};

// {
//     "request": {
//         "method":"GET",
//         "url":"/?wtr-session-id=IRtp5YKixjGJDi6vLlA76",
//         "header":{
//             "host":"localhost:9000",
//             "connection":"keep-alive",
//             "upgrade-insecure-requests":"1",
//             "user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/102.0.5005.40 Safari/537.36",
//             "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//             "sec-fetch-site":"none",
//             "sec-fetch-mode":"navigate",
//             "sec-fetch-user":"?1",
//             "sec-fetch-dest":"document",
//             "accept-encoding":"gzip, deflate, br"}
//         },
//         "response":{
//             "status":404,
//             "message":"Not Found",
//             "header":{}
//         },
//         "app":{
//             "subdomainOffset":2,
//             "proxy":false,"env":"development"
//         },
//         "originalUrl":"/?wtr-session-id=IRtp5YKixjGJDi6vLlA76",
//         "req":"<original node req>",
//         "res":"<original node res>",
//         "socket":"<original node socket>"
// }

export {urlRedirect};
