import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

interface UserListProps {
  onUserSelect: (user: { id: string; username: string }) => void; // Callback prop to notify selection
}

interface User {
  id: string;
  username: string;
  email: string;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const { currentUser } = useAuth();

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList: User[] = [];
        querySnapshot.forEach((doc: any) => {
          const userData = doc.data();
          userList.push({
            id: doc?.id,
            username: userData?.username,
            email: userData?.email,
          });
        });
        const filteredList = userList?.filter(user => user?.id !== currentUser?.uid);
        setUsers(filteredList);
        setFilteredUsers(filteredList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUser?.uid]);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users?.filter((user) =>
      user?.username?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return (
    <div className="container">
      <h2 className="text-primary text-center h5">All Users</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul className="list-group">
        {filteredUsers?.length > 0 ? (
          filteredUsers?.map((user, index) => (
            <li
              key={user?.id}
              className="list-group-item"
              onClick={() =>
                onUserSelect({ id: user?.id, username: user?.username })
              }
              style={{ cursor: "pointer" }}
            >
              <b><i>{index + 1}.</i></b> <i>{user?.username} - {user?.email}</i>
            </li>
          ))
        ) : (
          <li className="list-group-item">No users found</li>
        )}
      </ul>
    </div>
  );
};

export default UserList;
