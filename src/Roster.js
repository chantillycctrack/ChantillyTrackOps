import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Roster = () => {
  const [athletes, setAthletes] = useState([]);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    // Only fetch athletes based on the toggle
    const q = query(collection(db, "athletes"), where("isActive", "==", !showInactive));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAthletes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [showInactive]);

  const toggleStatus = async (id, currentStatus) => {
    const athleteRef = doc(db, "athletes", id);
    await updateDoc(athleteRef, { isActive: !currentStatus });
  };

  return (
    <div>
      <button onClick={() => setShowInactive(!showInactive)}>
        {showInactive ? "Show Active Roster" : "View Inactive/Historical"}
      </button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Group</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {athletes.map(a => (
            <tr key={a.id}>
              <td>{a.lastName}, {a.firstName}</td>
              <td>{a.currentGrade}</td>
              <td>{a.group}</td>
              <td>
                <button onClick={() => toggleStatus(a.id, a.isActive)}>
                  {a.isActive ? "Deactivate" : "Re-activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roster;
