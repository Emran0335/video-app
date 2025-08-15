"use client";
import { useRegisterUserMutation } from "@/state/api";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

type SignInProps = {
  isSignIn: boolean;
  toggle: () => void;
};

const SignupPage = ({ isSignIn, toggle }: SignInProps) => {
  const [createUser, { isLoading }] = useRegisterUserMutation();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<File | string>("");
  const [coverImage, setCoverImage] = useState<File | string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username || !email || !password || !avatar || !coverImage) return;

    const userData = new FormData();
    userData.append("fullName", fullName);
    userData.append("username", username);
    userData.append("email", email);
    userData.append("description", description);
    userData.append("password", password);
    userData.append("avatar", avatar as File); // append file, not name
    userData.append("coverImage", coverImage as File); // append file, not name

    await createUser(userData); // make sure your mutation accepts FormData
    // Reset form
    setFullName("");
    setUsername("");
    setDescription("");
    setEmail("");
    setAvatar("");
    setCoverImage("");
    setPassword("");
    toggle();
  };

  const isFormValid = () => {
    return username && email && password;
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <label className="mb-1 block text-sm">Full Name</label>
        <input
          type="text"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          placeholder="Enter your fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Username</label>
        <input
          type="text"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          value={username}
          placeholder="Choose a username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Email</label>
        <input
          type="email"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          value={email}
          placeholder="Enter your email address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Description</label>
        <input
          type="text"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          placeholder="Describe yourself"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-2">
        <div>
          <label htmlFor="avatar" className="mb-1 block text-sm">
            {avatar ? "avatar" : "Choose Avatar"}
          </label>
          <input
            type="file"
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
            accept="image/*"
            placeholder="Choose Your Avatar"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setAvatar(e.target.files[0]);
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="coverImage" className="mb-1 block text-sm">
            {coverImage ? "CoverImage" : "Choose CoverImage"}
          </label>
          <input
            type="file"
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCoverImage(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className={`w-full rounded bg-teal-600 py-2 text-sm text-white hover:bg-teal-700" ${
          !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
        }`}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? "Creating Account" : "Create Account"}
      </button>
      {!isSignIn && (
        <div className="text-center text-teal-600">
          <span className="mr-1">If you have an account?</span>
          <button
            className="text-sm text-teal-600 hover:underline"
            onClick={() => toggle()}
          >
            Please Sign In
          </button>
        </div>
      )}
    </form>
  );
};

export default SignupPage;
