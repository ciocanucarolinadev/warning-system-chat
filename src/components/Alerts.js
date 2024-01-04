import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, ListGroup } from "react-bootstrap";
import { firestore } from "../firebase";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const alertsCollection = collection(firestore, "alerts");
      const alertsQUery = query(alertsCollection, orderBy('timestamp'));
      const alertsSnapshot = await getDocs(alertsQUery);
     
      const alertsData = alertsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAlerts(alertsData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  return (
    <div>
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.type} className="my-2">
          <p>Alert type: toxicity</p>
          <ListGroup>
            <ListGroup.Item>
              Sender: <strong>{alert.senderId}</strong>
            </ListGroup.Item>
            <ListGroup.Item>
              Receiver: <strong>{alert.receiverId}</strong>
            </ListGroup.Item>
            <ListGroup.Item>
              Negativity score: <strong>{alert.neg}</strong>
            </ListGroup.Item>
            <ListGroup.Item>
              Message Text: <strong>{alert.text}</strong>
            </ListGroup.Item>
          </ListGroup>
        </Alert>
      ))}
    </div>
  );
};

export default Alerts;
