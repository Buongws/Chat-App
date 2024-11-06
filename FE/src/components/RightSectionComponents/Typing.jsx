import "../../styles/typing.css";

const Typing = ({ name }) => (
  <div className="typing">
    <div className="typing__dot"></div>
    <div className="typing__dot"></div>
    <div className="typing__dot"></div>
    <p className="typing__name">{name} is typing...</p>
  </div>
);

export default Typing;
