import React, { useEffect, useState, useContext } from "react";
import { Usercontext } from "../../App";
import { useParams } from "react-router-dom";

const Userprofile = () => {
  const [userProfile, setuserProfile] = useState(null);
  const { state, dispatch } = useContext(Usercontext);
  const { userid } = useParams();
  const [showFollow, setShowFollow] = useState(
    state ? !state.followers.includes(userid) : true
  );
  useEffect(() => {
    fetch(`/user/${userid}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((result) => {
        console.log(result);
        setuserProfile(result);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }, [userid]);
  if (!userProfile) {
    return <div>Loading...</div>;
  }
  const followUser = () => {
    fetch("/follow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        dispatch({
          type: "UPDATE",
          payload: { following: data.following, followers: data.followers },
        });
        localStorage.setItem("user", JSON.stringify(data));
        setuserProfile((prevstate) => {
          return {
            ...prevstate,
            user: {
              ...prevstate.user,
              followers: [...prevstate.user.followers, data._id],
            },
          };
        });
        setShowFollow(false);
      });
  };
  const unfollowUser = () => {
    fetch("/unfollow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        unfollowId: userid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        dispatch({
          type: "UPDATE",
          payload: { following: data.following, followers: data.followers },
        });
        localStorage.setItem("user", JSON.stringify(data));
        setuserProfile((prevstate) => {
          const newFollower = prevstate.user.followers.filter(
            (item) => item != data._id
          );
          return {
            ...prevstate,
            user: {
              ...prevstate.user,
              followers: newFollower,
            },
          };
        });
        setShowFollow(true);
      });
  };
  return (
    <>
      {Userprofile ? (
        <div className="container">
          <div className="part-01">
            <div className="profile-picture">
              <img src={userProfile.user.pic} />
            </div>
            <div>
              <h4>{userProfile.user.name}</h4>
              <h5>{userProfile.user.email}</h5>
              <div className="content">
                <h6>{userProfile.posts.length} Posts</h6>
                <h6>{userProfile.user.followers.length} followers</h6>
                <h6>{userProfile.user.following.length} following</h6>
              </div>
              {showFollow ? (
                <button
                  style={{ margin: "10px" }}
                  className="btn waves-effect waves-light #64b5f6 blue darken-1"
                  onClick={() => followUser()}
                >
                  Follow
                </button>
              ) : (
                <button
                  style={{ margin: "10px" }}
                  className="btn waves-effect waves-light #64b5f6 blue darken-1"
                  onClick={() => unfollowUser()}
                >
                  Unfollow
                </button>
              )}
            </div>
          </div>
          <div className="gallery">
            {userProfile.posts.map((item) => {
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
      ) : (
        <h2>loading...</h2>
      )}
    </>
  );
};

export default Userprofile;
