const Forbidden = () => {
  return (
    <div className="main-area fix">
      <h1>403 Forbidden</h1>
      <p>You do not have permission to access this page.</p>
      <a href="/login">Go to Login</a>
    </div>
  );
};

export default Forbidden;