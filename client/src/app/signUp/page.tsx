"use client";
import { useRegisterUserMutation } from "@/state/api";
import React, { useState } from "react";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignupPage = () => {
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(true);
  const [createUser, { isLoading }] = useRegisterUserMutation();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<File | string>("");
  const [coverImage, setCoverImage] = useState<File | string>("");
  const [password, setPassword] = useState("");

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

    const response = await createUser(userData); // make sure your mutation accepts FormData

    if (!("error" in response)) {
      // ✅ Navigate to login page on success
      router.push("/signIn");
    }

    // Reset form
    setFullName("");
    setUsername("");
    setDescription("");
    setEmail("");
    setAvatar("");
    setCoverImage("");
    setPassword("");
  };

  const isFormValid = () => {
    return username && email && password;
  };

  return (
    <Modal
      name="Create New Task"
      isOpen={isModalNewTaskOpen}
      onClose={() => setIsModalNewTaskOpen(false)}
    >
      <form
        className="mx-auto mt-2 flex flex-col max-w-sm px-4 text-gray-900"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className="px-2 rounded-lg border py-1 mb-2"
          placeholder="FullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="text"
          className="px-2 rounded-lg border py-1 mb-2"
          value={username}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          className="px-2 rounded-lg border py-1 mb-2"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          className="px-2 rounded-lg border py-1 mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="file"
            className="px-2 rounded-lg border py-1 mb-2"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setAvatar(e.target.files[0]);
              }
            }}
          />
          <input
            type="file"
            className="px-2 rounded-lg border py-1 mb-2"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCoverImage(e.target.files[0]);
              }
            }}
          />
        </div>

        <input
          type="password"
          className="px-2 rounded-lg border py-1"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
      <div className="flex items-center justify-center mt-4">
        <p className="text-gray-600">
          If you already signed up!
          <Link href={"/signIn"} className="text-red-400 cursor-pointer">
            {" "}
            Please sing in
          </Link>
        </p>
      </div>
    </Modal>
  );
};

export default SignupPage;
