import React, { useEffect } from "react";
import { useState } from "react";
import { Form } from "react-router-dom";
import M from "materialize-css";
import { useNavigate } from "react-router-dom";
const Createpost = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (url) {
      fetch("/createpost", {
        method: "post",
        headers: {
          "content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          title,
          body,
          pic: url,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            M.toast({ html: data.error, classes: "#c62828 red darken-3" });
          } else {
            M.toast({
              html: "Created Post Successfully",
              classes: "#43a047 green darken-1",
            });
            navigate("/");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
  const postDetails = () => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "Insta-Clone");
    data.append("cloud_name", "dyj90tu9q");
    fetch("https://api.cloudinary.com/v1_1/dyj90tu9q/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setUrl(data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="card input-field crp">
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="body"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
        }}
      />
      <div className="file-field input-field">
        <div className="btn #64b5f6 blue darken-1">
          <span>UPLOAD IMAGE</span>
          <input
            type="file"
            // value={image}
            onChange={(e) => {
              setImage(e.target.files[0]);
            }}
          />
        </div>
        <div className="file-path-wrapper">
          <input className="file-path validate" />
        </div>
      </div>
      <button
        className="btn waves-effect waves-light #64b5f6 blue darken-1"
        onClick={() => {
          postDetails();
        }}
      >
        SUBMIT POST
      </button>
    </div>
  );
};

export default Createpost;
