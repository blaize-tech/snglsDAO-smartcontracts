import * as React from "react";
import { showReportDialog } from "@sentry/browser";
import { Link } from "react-router-dom";
import * as appCss from "../../layouts/App.scss";
import * as css from "./Errors.scss";
import { withTranslation } from 'react-i18next';



interface IExternalProps {
  errorMessage: string;
  sentryEventId?: string;
  goHome?: () => void;
}

class ErrorUncaught extends React.PureComponent<IExternalProps> {
  handleReport = () => {
    showReportDialog({ eventId: this.props.sentryEventId });
  }

  render() {
    //@ts-ignore
    const { t } = this.props;
    return (
      <div className={css.errorContainer}>
        <nav className={appCss.header}>
          <div>
            <div className={appCss.menu}>
              { this.props.goHome ?
                <Link to="/"><img onClick={this.props.goHome} src="/assets/images/logo.svg"/></Link>
                :
                <img src="/assets/images/logo.svg"/>
              }
            </div>
            {/* <div className={appCss.topInfo}>Alchemy</div> */}
          </div>
        </nav>
        <div className={css.content}>
          <div className={css.banner}>
            <img className={css.stars} src="/assets/images/Errors/stars-error.svg" />
          </div>
          <div className={css.title}>Something went wrong…</div>
          <div className={css.description}>{this.props.errorMessage}</div>
          <div>
            {/* { this.props.sentryEventId ? <a className={css.report} onClick={this.handleReport}>Report</a> : "" } */}
            { this.props.goHome ? <Link to="/"><button onClick={this.props.goHome} className={css.home}>Home</button></Link> : "" }
          </div>
        </div>
      </div>
    );
  }
}
//@ts-ignore
export default withTranslation()(ErrorUncaught)
