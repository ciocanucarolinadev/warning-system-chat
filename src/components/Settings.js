import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Form } from "react-bootstrap";

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [showEmailsForm, setShowEmailsForm] = useState(false);
  const [emails, setEmails] = useState([]);

  const getSettings = async () => {
    const settingsCollection = collection(firestore, "settings");
    const settingsSnapshot = await getDocs(settingsCollection);

    const settings = settingsSnapshot.docs.map((doc) => {
      if (doc.data().type === "emailAlert" && doc.data().value === true) {
        setShowEmailsForm(true);
        getEmailsToSendAlerts(doc.id);
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    setSettings(settings);
  };

  useEffect(() => {
    getSettings();
  }, []);

  const getEmailsToSendAlerts = async (settingId) => {
    const emailsCollection = collection(
      firestore,
      `settings/${settingId}/emails`
    );
    const emailsSnapshot = await getDocs(emailsCollection);

    const emails = emailsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEmails(emails);
  };

  const handleToggleChange = (setting, value) => {
    const index = settings.indexOf(setting);
    const settingsToUpdate = [...settings];

    settingsToUpdate[index].value = value;

    if (settingsToUpdate[index].type === "emailAlert" && value === true) {
      setShowEmailsForm(true);
      getEmailsToSendAlerts(settingsToUpdate[index].id);
    } else if (
      settingsToUpdate[index].type === "emailAlert" &&
      value === false
    ) {
      setShowEmailsForm(false);
    }

    handleSaveSettings(setting, value);
    setSettings(settingsToUpdate);
  };

  const handleSaveSettings = async (setting, value) => {
    try {
      const settingsRef = doc(firestore, "settings", setting.id);

      await updateDoc(settingsRef, {
        value: value,
      });
    } catch (error) {
      console.error(`Error updating setting:`, error);
    }
  };

  return (
    <>
      {settings && settings?.length > 0 && (
        <Form>
          {settings.map((setting) => {
            return (
              <Form.Group className="mb-3" key={setting.id}>
                <Form.Check
                  className="d-flex align-items-center"
                  type="switch"
                  id={setting.type}
                  label={setting.type}
                  checked={setting.value}
                  onChange={(e) =>
                    handleToggleChange(setting, e.target.checked)
                  }
                />
                {showEmailsForm && setting.type === "emailAlert" && (
                  <div>
                    <h6 className="d-block mt-3">
                      Next users will receive an email about toxicity alerts
                    </h6>
                    {emails?.map((it) => {
                      return <div key={it.id}>{it.email}</div>;
                    })}
                  </div>
                )}
              </Form.Group>
            );
          })}
        </Form>
      )}
    </>
  );
};

export default Settings;
