import axios from "axios"

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true
})

export async function register({ fullname, email, contact, password, isSeller }) {
    const response = await authApiInstance.post("/register", {
        fullname,
        email,
        contact,
        password,
        isSeller,
        role: isSeller ? "seller" : "buyer"
    })
    return response.data
}

export async function login({ email, password }) {
    const response = await authApiInstance.post("/login", {
        email,
        password,
    })
    return response.data
}

export async function getMe(){
    const response = await authApiInstance.get("/getme")
    return response.data
}

export async function googleAuth() {
    return new Promise((resolve, reject) => {
        const popup = window.open("http://localhost:3000/api/auth/google", "googleAuth", "width=500,height=600");
        
        const handleMessage = (event) => {
            if (event.origin !== "http://localhost:3000" && event.origin !== "http://localhost:5173") {
                return;
            }
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
                window.removeEventListener("message", handleMessage);
                resolve({ user: event.data.user });
            } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
                window.removeEventListener("message", handleMessage);
                reject(new Error(event.data.error || "Google Auth Failed"));
            }
        };

        window.addEventListener("message", handleMessage);
    });
}