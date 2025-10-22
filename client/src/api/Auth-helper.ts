type JwtPayload = any;

export const authHelper = {
  isAuthenticated: (): JwtPayload | false => {
    if (typeof window === "undefined") return false;
    const jwtStr = sessionStorage.getItem("jwt");
    return jwtStr ? JSON.parse(jwtStr) : false;
  },

  authenticate: (jwt: unknown, cb: () => void) => {
    if (typeof window !== "undefined") sessionStorage.setItem("jwt", JSON.stringify(jwt));
    cb();
  },

  clearJWT: (cb: () => void) => {
    if (typeof window !== "undefined") sessionStorage.removeItem("jwt");
    cb();
  },
};
