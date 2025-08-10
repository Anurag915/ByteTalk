import React from "react";
import assets from "../assets/assets";
import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [bio, setBio] = useState("");
  const { login } = useContext(AuthContext);

  // const onSubmitHandler = (e) => {
  //   e.preventDefault();
  //   if (currState === "Sign up" && !isDataSubmitted) {
  //     setIsDataSubmitted(true);
  //     login(currState === "Sign up" ? "signUp" : "login", {
  //       fullName,
  //       email,
  //       password,
  //       bio,
  //     });
  //     return;
  //   } else {
  //     // Handle login logic here
  //     console.log("Logging in with", { email, password });
  //   }
  // };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currState === "Sign up") {
      if (!isDataSubmitted) {
        // Move to bio step without sending request yet
        setIsDataSubmitted(true);
        return;
      } else {
        // Second submit → now send full signup data
        login("signUp", { fullName, email, password, bio });
      }
    } else {
      // Login flow
      login("login", { email, password });
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-xl">
      {/* left  */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />
      {/* right */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              className="w-5 cursor-pointer"
              alt=""
              onClick={() => setIsDataSubmitted(false)}
            />
          )}
        </h2>
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            placeholder="Full Name"
            required
            value={fullName}
            className="p-2 bg-transparent border rounded-md border-gray-500 focus:outline-none"
          ></input>
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
            ></input>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter Password"
              required
              value={password}
              className="p-2 bg-transparent border rounded-md border-gray-500 focus:outline-none"
            ></input>
          </>
        )}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Provide a short bio..."
            required
            value={bio}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        )}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-600">
              Already have an account ?
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p
              className="text-sm text-gray-600"
              onClick={() => {
                setCurrState("Sign up");
              }}
            >
              Create an account{" "}
              <span className="font-medium text-violet-500 cursor-pointer">
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
