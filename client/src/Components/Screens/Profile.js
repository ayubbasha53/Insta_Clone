import React, { useEffect, useState, useContext } from "react";
import { Usercontext } from "../../App";
const Profile = () => {
  const [mypics, setpics] = useState([]);
  const { state, dispatch } = useContext(Usercontext);
  const [image, setImage] = useState("");

  useEffect(() => {
    fetch("/mypost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setpics(result.mypost);
      });
  }, []);

  useEffect(() => {
    if (image) {
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
          // localStorage.setItem(
          //   "user",
          //   JSON.stringify({ ...state, pic: data.url })
          // );
          // dispatch({ type: "UPDATEPIC", payload: data.url });
          fetch("/updatepic", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({ pic: data.url }),
          })
            .then((res) => res.json())
            .then((result) => {
              console.log(result);
              localStorage.setItem(
                "user",
                JSON.stringify({ ...state, pic: result.pic })
              );
              dispatch({ type: "UPDATEPIC", payload: result.pic });
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [image]);

  const updatePhoto = (file) => {
    setImage(file);
  };
  return (
    <div className="container">
      <div className="part-01">
        <div className="profile-picture">
          <img src={state ? state.pic : "Loading"} />

          <div className="file-field input-field">
            <div className="btn #64b5f6 blue darken-1">
              <span>UPDATE PICTURE</span>
              <input
                type="file"
                // value={image}
                onChange={(e) => {
                  updatePhoto(e.target.files[0]);
                }}
              />
            </div>
            <div className="file-path-wrapper">
              <input className="file-path validate" />
            </div>
          </div>
        </div>
        <div>
          <h4>{state ? state.name : "Loading"}</h4>
          <h5>{state ? state.email : "Loading"}</h5>
          <div className="content">
            <h6>{mypics.length} posts</h6>
            <h6>
              {state && state.followers ? state.followers.length : "0"}
              followers
            </h6>
            <h6>
              {state && state.following ? state.following.length : "0"}
              following
            </h6>
          </div>
        </div>
      </div>
      <div className="gallery">
        {mypics.map((item) => {
          return (
            <img
              key={item._id}
              className="item"
              src={item.photo}
              alt={item.title}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
