import React, { useEffect, useState } from "react";
import "./group_page.css"; // create this CSS file for styling if needed
import {
  fetchAllGroups,
  createGroup,
  removeStudentFromGroup,
  deleteGroup,            // <- already used for leader-only delete
  addStudentToGroup,      // <- already used for leader-only add
} from "../api"; // adjust path if needed

export default function GroupPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newMembers, setNewMembers] = useState(["", "", ""]); // initial 3 inputs
  const [creating, setCreating] = useState(false);
  const [addMemberInputs, setAddMemberInputs] = useState({}); // input per group

  useEffect(() => {
    const cachedUser = localStorage.getItem("session");
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      parsed.student_id = parsed.student_id.trim();
      parsed.mail = parsed.mail.trim();
      setUser(parsed);
    }
  }, []);
  

  const refreshGroups = async () => {
    const res = await fetchAllGroups();
    let fetchedGroups = res.data;

    // Faculty: see all groups (view-only). Students: see own group.
    if (user?.usr_type === "Student") {
      const ownGroup = fetchedGroups.find((g) =>
        g.student_id.includes(user.student_id)
      );
      fetchedGroups = ownGroup ? [ownGroup] : [];
    }
    setGroups(fetchedGroups);
  };

  useEffect(() => {
    const loadGroups = async () => {
      try {
        await refreshGroups();
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadGroups();
  }, [user]);

  const handleInputChange = (index, value) => {
    const updated = [...newMembers];
    updated[index] = value;
    setNewMembers(updated);
  };

  const handleRemoveStudent = async (groupId, studentId) => {
    if (!window.confirm(`Remove student ${studentId} from group ${groupId}?`)) return;
    try {
      await removeStudentFromGroup(groupId, studentId);
      await refreshGroups();
      alert("Student removed from group.");
    } catch (err) {
      alert(err.response?.data?.error || "Error removing student");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm(`Are you sure you want to delete group ${groupId}?`)) return;
    try {
      await deleteGroup(groupId);
      await refreshGroups();
      alert("Group deleted successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting group");
    }
  };

  const handleAddMember = async (groupId) => {
    const newId = addMemberInputs[groupId];
    if (!newId) {
      alert("Please enter a student ID");
      return;
    }
    try {
      await addStudentToGroup(groupId, newId);
      await refreshGroups();
      setAddMemberInputs((prev) => ({ ...prev, [groupId]: "" }));
      alert("Student added successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Error adding student");
    }
  };

  const handleCreateGroup = async () => {
  if (!user) return;

  const leaderId = user.student_id;
  const studentIds = newMembers.slice(1).filter((id) => id.trim() !== ""); // only other members

  // local duplicate check
  const duplicates = studentIds.filter(
    (item, index) => studentIds.indexOf(item) !== index
  );
  if (duplicates.length > 0) {
    alert(`Duplicate student IDs found: ${[...new Set(duplicates)].join(", ")}`);
    return;
  }

  setCreating(true);
  try {
    await createGroup({
      leader_id: leaderId,
      student_id: [leaderId, ...studentIds], // final group
    });
    await refreshGroups();
    setShowCreate(false);
    setNewMembers(["", "", ""]);
    alert("Group created successfully!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Error creating group");
  } finally {
    setCreating(false);
  }
};


  if (loading) return <p className="p-6">Loading groups...</p>;
  if (!user) return <p className="p-6">User not logged in.</p>;

  const studentGroupExists =
    user.usr_type === "Student" &&
    groups.some((g) => g.student_id.includes(user.student_id));

  return (
    <div className="p-6 mt-navbar max-w-6xl mx-auto" style={{marginTop: '120px', maxWidth: '800px'}}>
      <h2 className="text-xl font-bold mb-4">
        {user.usr_type === "Faculty" ? "All Groups" : "Your Group"}
      </h2>

      {/* Group list */}
      {groups.map((group) => {
        const isLeader =
        user.usr_type === "Student" &&
        (group.leader_id
          ? String(group.leader_id).trim() === String(user.student_id).trim()
          : group.student_id[0] === user.student_id);
      
      
          

        // ⛔ Faculty is view-only. ✅ Only leader can manage AND group is not registered.
        const canManage = isLeader && group.isRegistered !== 1;

        return (
          <div key={group.id} className="border p-3 rounded mb-3">
            <h3 className="font-semibold">Group ID: {group.id}</h3>
            <p>Student IDs: {group.student_id.join(", ")}</p>

            {/* ✅ Show registration status */}
            {group.isRegistered === 1 ? (
              <p className="text-green-600 font-medium mt-1">
                ✅ Group has completed thesis registration
              </p>
            ) : (
              <p className="text-orange-600 font-medium mt-1">
                ⚠️ Group has not completed thesis registration
              </p>
            )}

            {group.students && group.students.length > 0 && (
              <ul className="ml-4">
                {group.students.map((s, index) => (
                  <li key={s.student_id}>
                    {s.Name} ({s.mail}) - ID: {s.student_id}
                    {(String(group.leader_id || group.student_id[0]).trim() === String(s.student_id).trim()) && (
                    <span className="ml-2 text-blue-600">[Group Leader]</span>
                  )}

                      {canManage && (
                      <button
                        onClick={() => handleRemoveStudent(group.id, s.student_id)}
                        className="ml-2 text-red-600 underline"
                        disabled={group.student_id.length <= 3}
                        title={
                          group.student_id.length <= 3
                            ? "Group must have at least 3 students"
                            : ""
                        }
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Add new member (Leader only; max 5; not registered) */}
            {canManage && group.student_id.length < 5 && (
              <div className="mt-2">
                <input
                  type="text"
                  value={addMemberInputs[group.id] || ""}
                  onChange={(e) =>
                    setAddMemberInputs((prev) => ({
                      ...prev,
                      [group.id]: e.target.value,
                    }))
                  }
                  placeholder="New Student ID"
                  className="border p-1 mr-2"
                />
                <button
                  onClick={() => handleAddMember(group.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Add Member
                </button>
              </div>
            )}

            {/* Delete whole group (Leader only; not registered) */}
            {canManage && (
              <button
                onClick={() => handleDeleteGroup(group.id)}
                className="bg-red-600 text-white px-3 py-1 rounded mt-2 block"
              >
                Delete Group
              </button>
            )}

            
            {user.usr_type === "Faculty" && (
              <button
                className="tp-button"
                style={{ marginTop: "10px" }}
                onClick={() => {
                  localStorage.setItem("Group_id", group.id);
                  window.location.href = "/research_help";
                }}
              >
                Assign RA/TA
              </button>
            )}
          </div>
        );
      })}

      {/* Create Group button for students without a group */}
      {user.usr_type === "Student" && !studentGroupExists && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Create a Group
        </button>
      )}

      {/* Group creation form */}
      {showCreate && (
        <div className="border p-4 rounded mt-4">
          <h3 className="font-semibold mb-2">
            Add student IDs (including yourself)
          </h3>

          {newMembers.map((id, index) => (
            <input
              key={index}
              type="text"
              value={index === 0 ? user.student_id : id} // auto-fill leader
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder={index === 0 ? "Leader ID (You)" : `Student ID ${index}`}
              className={`border p-2 mb-2 block w-full ${index === 0 ? "bg-gray-100 font-semibold" : ""}`}
              readOnly={index === 0} // leader can't be edited
            />
          ))}


          {newMembers.length < 5 && (
            <button
              onClick={() => setNewMembers([...newMembers, ""])}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Add Member
            </button>
          )}

          {newMembers.length > 3 && (
            <button
              onClick={() => setNewMembers((prev) => prev.slice(0, prev.length - 1))}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Remove Member
            </button>
          )}

          <button
            onClick={handleCreateGroup}
            disabled={creating}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2 block"
          >
            {creating ? "Creating..." : "Create Group"}
          </button>
          {/* Back button below Create Group */}
          <button
            onClick={() => setShowCreate(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-2 block"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
