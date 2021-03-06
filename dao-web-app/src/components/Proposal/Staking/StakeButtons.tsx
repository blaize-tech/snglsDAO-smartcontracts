import { Address, IDAOState, IProposalOutcome, IProposalStage, IProposalState, Stake } from "@daostack/client";
import { approveStakingGens, stakeProposal } from "actions/arcActions";
import { enableWalletProvider } from "arc";

import BN = require("bn.js");
import classNames from "classnames";
import Analytics from "lib/analytics";
import { formatTokens } from "lib/util";
import { ActionTypes, default as PreTransactionModal } from "components/Shared/PreTransactionModal";
import { Page } from "pages";
import Tooltip from "rc-tooltip";
import * as React from "react";
import { connect } from "react-redux";
import { Modal } from "react-router-modal";
import { showNotification } from "reducers/notifications";
import { IProfileState } from "reducers/profilesReducer";
import { withTranslation } from 'react-i18next';


import * as css from "./StakeButtons.scss";

interface IState {
  pendingPrediction: number;
  showApproveModal: boolean;
  showPreStakeModal: boolean;
}

interface IExternalProps {
  proposal: IProposalState;
  beneficiaryProfile?: IProfileState;
  contextMenu?: boolean;
  currentAccountAddress?: Address;
  currentAccountGens: BN|null;
  currentAccountGenStakingAllowance: BN;
  dao: IDAOState;
  expired?: boolean;
  parentPage: Page;
  stakes: Stake[];
}

interface IDispatchProps {
  stakeProposal: typeof stakeProposal;
  showNotification: typeof showNotification;
  approveStakingGens: typeof approveStakingGens;
}

const mapDispatchToProps = {
  approveStakingGens,
  stakeProposal,
  showNotification,
};

type IProps = IExternalProps & IDispatchProps;

class StakeButtons extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      pendingPrediction: null,
      showApproveModal: false,
      showPreStakeModal: false,
    };
  }

  public showApprovalModal = async (_event: any): Promise<void> => {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) { return; }

    this.setState({ showApproveModal: true });
  }

  public closeApprovalModal = (_event: any): void => {
    this.setState({ showApproveModal: false });
  }

  public closePreStakeModal = (_event: any): void => {
    this.setState({ showPreStakeModal: false });
  }

  public showPreStakeModal = (prediction: number): (_event: any) => void => async (_event: any): Promise<void> => {
    if (!await enableWalletProvider( { showNotification: this.props.showNotification })) { return; }
    this.setState({ pendingPrediction: prediction, showPreStakeModal: true });
  }

  public handleCancelPreApprove = async (_event: any): Promise<void> => {
    this.setState({ showApproveModal: false });
  }

  public handleClickPreApprove = async (_event: any): Promise<void> => {
    if (!await enableWalletProvider( { showNotification: this.props.showNotification })) { return; }

    const { approveStakingGens } = this.props;
    approveStakingGens(this.props.proposal.votingMachine);

    Analytics.track("Enable predictions");

    this.setState({ showApproveModal: false });
  }

  private getStakeProposalAction = (proposal: IProposalState, dao: IDAOState, pendingPrediction: number) =>
    (amount: number) => {
      this.props.stakeProposal(proposal.dao.id, proposal.id, pendingPrediction, amount);
      //@ts-ignore
      const { t } = this.propos;
      Analytics.track("Stake", {
        "DAO Address": proposal.dao.id,
        "DAO Name": dao.name,
        "GEN Staked": amount,
        "Proposal Hash": proposal.id,
        "Proposal TItle": proposal.title,
        "Scheme Address": proposal.scheme.address,
        "Scheme Name": proposal.scheme.name,
        "Stake Type": pendingPrediction === IProposalOutcome.Fail ? t('proposal.fail') : pendingPrediction === IProposalOutcome.Pass ? t('proposal.pass') : t('proposal.none'),
      });
    };

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const {
      beneficiaryProfile,
      contextMenu,
      currentAccountAddress,
      currentAccountGens,
      currentAccountGenStakingAllowance,
      dao,
      expired,
      parentPage,
      proposal,
      stakes,
    } = this.props;

    const {
      pendingPrediction,
      showApproveModal,
      showPreStakeModal,
    } = this.state;

    let currentStake: Stake;
    let currentAccountPrediction = 0;
    if (stakes.length > 0) {
      currentStake = stakes[0];
    }
    if (currentStake) {
      currentAccountPrediction = currentStake.staticState.outcome;
    }

    const isPredicting = pendingPrediction !== null;

    if (showApproveModal) {
      return (
        <Modal onBackdropClick={this.closeApprovalModal}>
          <div className={css.preApproval}>
            <div className={css.preapproveWrapper}>
      <h3>{t('proposal.activatePredictions')}</h3>
              <p>
              {t('proposal.inOrderToActivate')}
              </p>
              <div className={css.preapproveButtonsWrapper}>
                <button onClick={this.handleCancelPreApprove} data-test-id="button-cancel">Cancel</button>
                <button onClick={this.handleClickPreApprove} data-test-id="button-preapprove">Preapprove</button>
              </div>
            </div>
          </div>
        </Modal>
      );
    }

    const wrapperClass = classNames({
      [css.predictions]: true,
      [css.detailView]: parentPage === Page.ProposalDetails,
      [css.contextMenu]: contextMenu,
      [css.historyView]: parentPage === Page.DAOHistory,
      [css.unconfirmedPrediction]: isPredicting,
    });

    const stakingEnabled = (proposal.stage === IProposalStage.Queued && !expired) ||
      (proposal.stage === IProposalStage.PreBoosted);

    const disabledMessage =
      (proposal.stage === IProposalStage.Queued && expired) || proposal.stage === IProposalStage.ExpiredInQueue ? t("proposal.cantPredict") :
        (proposal.stage === IProposalStage.Boosted || proposal.stage === IProposalStage.QuietEndingPeriod) ? t("proposal.cantPredictOnBoosted") :
          (proposal.stage === IProposalStage.Executed) ? t('proposal.cantPredictOnPassedFailded', {status: proposal.winningOutcome === IProposalOutcome.Pass ? t("proposal.passed") : t("proposal.failed")}) : "";

    const hasGens = currentAccountGens && currentAccountGens.gt(new BN(0));

    // show staking buttons when !this.props.currentAccountAddress, even if no GENs
    const disableStakePass = (currentAccountAddress && !hasGens) || currentAccountPrediction === IProposalOutcome.Fail;
    const disableStakeFail = (currentAccountAddress && !hasGens) || currentAccountPrediction === IProposalOutcome.Pass;

    const passButtonClass = classNames({
      [css.pendingPrediction]: pendingPrediction === IProposalOutcome.Pass,
      [css.passButton]: true,
    });

    const failButtonClass = classNames({
      [css.pendingPrediction]: pendingPrediction === IProposalOutcome.Fail,
      [css.failButton]: true,
    });

    const tip = (prediction: IProposalOutcome) =>
      !hasGens ?
        "Insufficient GENs" :
        currentAccountPrediction === prediction ?
          "Can't change your prediction" : ""
      ;

    const passButton = (
      <button className={passButtonClass} onClick={disableStakePass ? null : this.showPreStakeModal(1)} data-test-id="stakePass">
        <img className={css.stakeIcon} src="/assets/images/Icon/v.svg"/> {t('proposal.pass')}
      </button>
    );

    const failButton = (
      <button className={failButtonClass} onClick={disableStakeFail ? null : this.showPreStakeModal(2)}>
        <img className={css.stakeIcon} src="/assets/images/Icon/x.svg"/> {t('proposal.fail')}
      </button>
    );

    // If don't have any staking allowance, replace with button to pre-approve
    // show staking buttons when !this.props.currentAccountAddress, even if no allowance
    if (stakingEnabled && (currentAccountAddress && currentAccountGenStakingAllowance && currentAccountGenStakingAllowance.eq(new BN(0)))) {
      return (
        <div className={wrapperClass}>

          {contextMenu ?
            <div className={css.contextTitle}>
              <div>
                <span>
                {t('proposal.predict')}
                </span>
              </div>
            </div>
            : ""
          }

          <div className={css.enablePredictions}>
        <button onClick={this.showApprovalModal} data-test-id="button-enable-predicting">{t('proposal.enablePredictions')}</button>
          </div>
        </div>
      );
    }

    return (
      <div className={wrapperClass}>
        {showPreStakeModal ?
          <PreTransactionModal
            //@ts-ignore
            actionType={pendingPrediction === IProposalOutcome.Pass ? ActionTypes.StakePass : ActionTypes.StakeFail}
            action={this.getStakeProposalAction(proposal, dao, pendingPrediction)}
            beneficiaryProfile={beneficiaryProfile}
            closeAction={this.closePreStakeModal}
            currentAccountGens={currentAccountGens}
            dao={dao}
            parentPage={parentPage}
            proposal={proposal}

          /> : ""
        }

        {contextMenu ?
          <div className={css.contextTitle}>
            <div>
              <span>
              {t('proposal.predict')}
              </span>
            </div>
          </div>
          : ""
        }

        <div className={contextMenu ? css.contextContent : css.stakeControls}>
          {stakingEnabled ?
            <div>
              {
                (currentAccountAddress && tip(IProposalOutcome.Fail) !== "") ?
                  <Tooltip placement="left" trigger={["hover"]} overlay={tip(IProposalOutcome.Fail)}>
                    {passButton}
                  </Tooltip> :
                  passButton
              }
              {parentPage !== Page.ProposalDetails && proposal.stage === IProposalStage.Queued && !expired && proposal.upstakeNeededToPreBoost.gten(0) ?
                <div className={css.toBoostMessage}>&gt; {formatTokens(proposal.upstakeNeededToPreBoost, t('proposal.genToBoost'))}</div>
                : ""}
              {
                (currentAccountAddress && tip(IProposalOutcome.Pass) !== "") ?
                  <Tooltip placement="left" trigger={["hover"]} overlay={tip(IProposalOutcome.Pass)}>
                    {failButton}
                  </Tooltip> :
                  failButton
              }
              {parentPage !== Page.ProposalDetails && proposal.stage === IProposalStage.PreBoosted && !expired && proposal.downStakeNeededToQueue.gtn(0) ?
                <div className={css.toBoostMessage}>&gt;= {formatTokens(proposal.downStakeNeededToQueue, t('proposal.genTOUnBoost'))}</div>
                : ""}
            </div>
            : <span className={css.disabledPredictions}>
              {disabledMessage}
            </span>
          }
        </div>
      </div>
    );
  }
}
//@ts-ignore
export default connect(null, mapDispatchToProps)(withTranslation()(StakeButtons));
