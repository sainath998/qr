import cookie from "js-cookie";
import Router from "next/router";
import { parseCookies } from "nookies";
import { jwtDecode } from "jwt-decode";

export const getUserDetails = () => {
  const { user_token } = parseCookies();
  if (!user_token) {
    return null;
  }

  return jwtDecode(user_token);
};

export const handleLogin = (t, routeNext) => {
  cookie.set("user_token", t);
  // if (routeNext.query && routeNext.query.next) {
  //   Router.push(routeNext.query.next);
  // } else {
  //   Router.push("/");
  // }
  // Router.push("/");
  window.location.href = "/";
};

export const handleLogout = () => {
  cookie.remove("user_token");
  // Router.push("/");
};

export const destroyCookie = () => {
  cookie.remove("user_token");
  // Router.reload("/");
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push({ pathname: location, query: { next: ctx.pathname } });
  }
};

export const slugify = (string) => {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
