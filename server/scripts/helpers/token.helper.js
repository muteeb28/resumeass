export const clearCookie = (res) => {
    res.clearCookie("accessToken", {
        httpOnly: true, // prevents XSS
        secure: process.env.NODE_ENV === "production", // only HTTPS in production
        sameSite: process.env.SAME_SITE, // needed for cross-site cookies
        domain: process.env.DOMAIN, // make cookie accessible to all subdomains
    });
};