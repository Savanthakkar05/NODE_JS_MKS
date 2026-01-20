import "../style/loader.scss";
 
const FullPageLoader = () => {
  return (
    <div className="loader-overlay">
      <div className="google-loader">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="loader-text">Please wait...</p>
    </div>
  );
};
 
export default FullPageLoader;