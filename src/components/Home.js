import { NavLink } from "react-router-dom";

const Home = (props) => {
  return (
    <div>
      <h3>Demo Warning System</h3>
      {!props?.user?.email?.includes("admin") && (
        <NavLink to={"/chat"}>Let's Chat</NavLink>
      )}
    </div>
  );
};

export default Home;
