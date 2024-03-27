import { useRouteError } from "react-router-dom";
import oops from './tmnt_oops.gif'

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="terror-page">
      <h1>Ooops!</h1>
      <img src={oops} alt="oops" />
      <p>Sorry, an unexpected terror has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}