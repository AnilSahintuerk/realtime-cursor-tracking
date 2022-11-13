import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { app } from "../firebase/clientApp";
import Cursor from "../components/Cursor";

export default function Home() {
  const [cursors, cursorsLoading, cursorsError] = useCollection(
    collection(getFirestore(app), "cursor"),
    {}
  );

  const [mouseX, setMouseX] = useState(1000000);
  const [mouseY, setMouseY] = useState(1000000);
  const [userId, setUserId] = useState();
  const [color, setColor] = useState(
    colors[Math.floor(Math.random() * colors.length)]
  );
  const [lastActive, setLastActive] = useState(Date.now());
  const [tick, setTick] = useState(0);

  const addCursorDocument = () => {
    addDoc(collection(getFirestore(app), "cursor"), {
      mouseX,
      mouseY,
      lastActive,
      color,
    }).then((docRef) => {
      setUserId(docRef.id);
    });
  };

  // Update the document every 200ms
  const handleMousemove = (e) => {
    setMouseX(e.clientX / window.innerWidth);
    setMouseY(e.clientY / window.innerHeight);
    setLastActive(Date.now());
    setTimeout(() => {
      updateDoc(doc(getFirestore(app), "cursor", userId), {
        mouseX,
        mouseY,
        lastActive,
        color,
      }).catch((error) => {
        setDoc(doc(getFirestore(app), "cursor", userId), {
          mouseX,
          mouseY,
          lastActive,
          color,
        });
      });
    }, 200);
  };

  //  Responsible for creating a new cursor document in the database on page load
  useEffect(() => {
    addCursorDocument();
  }, []);

  // Responsible for removing cursors that have not been active for 3 seconds
  // This is done by checking the lastActive timestamp
  // If the lastActive timestamp is older than 3 seconds, the cursor is removed
  // This is done by setting a timeout that runs every second
  // The last curor document in the collection is not removed because it also deletes the collection
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick + 1);
    }, 1000);

    if (userId) {
      cursors?.docs.forEach((cursor) => {
        if (cursor.data().lastActive < Date.now() - 3000) {
          if (cursor.id !== userId && cursors.docs.length > 1) {
            deleteDoc(doc(getFirestore(app), "cursor", cursor.id));
          }
        }
      });
    }

    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="w-screen h-screen" onMouseMove={handleMousemove}>
      {cursors?.docs.map(
        (doc) =>
          doc.id !== userId && (
            <Cursor
              key={doc.id}
              mouseX={doc.data().mouseX}
              mouseY={doc.data().mouseY}
              color={doc.data().color}
            />
          )
      )}
    </div>
  );
}

const colors = [
  "#264653ff",
  "#2a9d8fff",
  "#e9c46aff",
  "#f4a261ff",
  "#e76f51ff",
  "#71093b",
  "#990b52",
  "#ffdf00",
  "#a77afe",
  "#0096c7",
  "#ade8f4",
  "white",
  "#944910",
  "#999491",
  "#ad8164",
];
