import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3000";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  creationDate: string;
  profilePicture: string;
}

const InstructorProfileContent = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/user/current-user`, {
          method: "GET",
          credentials: "include", // Include session cookies
        });
        const result = await response.json();
        console.log("Fetched profile:", result);

        if (response.ok) {
          if (result.role !== "instructor") {
            setError("Access denied: Instructors only");
          } else {
            setProfile({
              id: result.id,
              name: result.name,
              email: result.email,
              role: result.role,
              creationDate: result.creationDate || new Date().toISOString(),
              profilePicture: result.profilePicture || "default.jpg",
            });
          }
        } else {
          setError(result.message || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error fetching profile: Network or server error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap">
          <div className="dashboard__content-title">
            <h4 className="title">My Profile</h4>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="profile__content-wrap">
                <p>Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap">
          <div className="dashboard__content-title">
            <h4 className="title">My Profile</h4>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="profile__content-wrap">
                <p className="text-danger">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Split name into first and last name (optional)
  const nameParts = profile!.name.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  return (
    <div className="col-lg-9">
      <div className="dashboard__content-wrap">
        <div className="dashboard__content-title">
          <h4 className="title">My Profile</h4>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="profile__content-wrap">
              <ul className="list-wrap">
                <li>
                  <span>Registration Date</span>{" "}
                  {new Date(profile!.creationDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </li>
                <li>
                  <span>First Name</span> {firstName || "Not provided"}
                </li>
                <li>
                  <span>Last Name</span> {lastName || "Not provided"}
                </li>
                <li>
                  <span>Email</span> {profile!.email}
                </li>
                <li>
                  <span>Role</span> {profile!.role}
                </li>
                <li>
                  <span>Profile Picture</span>{" "}
                  <img
                    src={
                      profile!.profilePicture.startsWith("http")
                        ? profile!.profilePicture
                        : `${BASE_URL}/Uploads/${profile!.profilePicture}`
                    }
                    alt="Profile"
                    style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                    onError={(e) => (e.currentTarget.src = `${BASE_URL}/Uploads/default.jpg`)}
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfileContent;