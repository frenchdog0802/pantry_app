type JwtPayload = any;

export const authHelper = {
  isAuthenticated: (): JwtPayload | false => {
    if (typeof window === "undefined") return false;
    const jwtStr = sessionStorage.getItem("jwt");
    return jwtStr ? JSON.parse(jwtStr) : false;
  },

  getJWT: (): string | null => {
    if (typeof window === "undefined") return null;
    const jwtStr = sessionStorage.getItem("jwt");
    return jwtStr ? JSON.parse(jwtStr) : null;
  },

  authenticate: (jwt: unknown, cb: () => void) => {
    if (typeof window !== "undefined") sessionStorage.setItem("jwt", JSON.stringify(jwt));
    cb();
  },

  clearJWT: () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("jwt");
  },
};
