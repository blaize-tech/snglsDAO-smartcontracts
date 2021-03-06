import { IDAOState, IProposalState, IProposalType } from "@daostack/client";
import classNames from "classnames";
import { GenericSchemeRegistry } from "genericSchemeRegistry";
import * as React from "react";
import { IProfileState } from "reducers/profilesReducer";
import * as css from "./ProposalSummary.scss";
import ProposalSummaryContributionReward from "./ProposalSummaryContributionReward";
import ProposalSummaryKnownGenericScheme from "./ProposalSummaryKnownGenericScheme";
import ProposalSummarySchemeRegistrar from "./ProposalSummarySchemeRegistrar";
import ProposalSummaryUnknownGenericScheme from "./ProposalSummaryUnknownGenericScheme";
import { withTranslation } from 'react-i18next';


interface IProps {
  beneficiaryProfile?: IProfileState;
  detailView?: boolean;
  dao: IDAOState;
  proposal: IProposalState;
  transactionModal?: boolean;
}

class ProposalSummary extends React.Component<IProps> {

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const { proposal, detailView, transactionModal } = this.props;

    const proposalSummaryClass = classNames({
      [css.detailView]: detailView,
      [css.transactionModal]: transactionModal,
      [css.proposalSummary]: true,
    });

    if (proposal.contributionReward) {
      return <ProposalSummaryContributionReward {...this.props} />;
    } else if (proposal.schemeRegistrar) {
      return <ProposalSummarySchemeRegistrar {...this.props} />;
    } else if (proposal.type === IProposalType.GenericScheme) {
      const genericSchemeRegistry = new GenericSchemeRegistry();
      const genericSchemeInfo = genericSchemeRegistry.getSchemeInfo(proposal.genericScheme.contractToCall);
      if (genericSchemeInfo) {
        return <ProposalSummaryKnownGenericScheme  {...this.props} genericSchemeInfo={genericSchemeInfo} />;
      } else {
        return <ProposalSummaryUnknownGenericScheme {...this.props} />;
      }

    } else {
      return <div className={proposalSummaryClass}>Unknown proposal type</div>;
    }
  }
}

//@ts-ignore
export default withTranslation()(ProposalSummary)