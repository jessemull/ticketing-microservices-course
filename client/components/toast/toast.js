const Toast = ({ id, message }) => {
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      <div id={id} className="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="toast-body">{message}</div>
      </div>
    </div>
  )
}

export default Toast