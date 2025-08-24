import React, { useState } from "react";

const SingupPage = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  return (
    <div>
      <form action="">
        <input
          type="text"
          placeholder="FullName"
          value={fullName}
          onChange={(e: any) => e.target.value(fullName)}
        />
      </form>
    </div>
  );
};

export default SingupPage;
