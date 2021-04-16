# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

I took the liberty of creating a homepage that welcomes a user to the site. If they are a returning user, they will encounter a page that welcomes them back by their email address. If they have not registered yet, or the cookies do not recognize them, then they will be prompted with a generic message to either register or sign-up. 

In order to use the functions of the site, you must register with an email and pasword. Don't worry, your password will be secured via the bcrypt hashing library.

Enough chatter, get to it! Scroll down to getting started so you can... well... get started!

## Final Product

!["screenshot description"](https://github.com/austinkret/tinyapp/blob/master/docs/1.%20Home%20Page%20-%20First%20Time.png)
!["screenshot description"](https://github.com/austinkret/tinyapp/blob/master/docs/2.%20Login%20Page.png)
!["screenshot description"](https://github.com/austinkret/tinyapp/blob/master/docs/3.%20Home%20Page%20-%20Logged%20In.png)
!["screenshot description"](https://github.com/austinkret/tinyapp/blob/master/docs/4.%20MyURLs%20Page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.