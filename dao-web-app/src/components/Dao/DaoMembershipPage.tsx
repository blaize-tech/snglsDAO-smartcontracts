import { Address, IDAOState, IProposalStage, Proposal, Vote, Scheme, Stake } from "@daostack/client";
import { getArc, enableWalletProvider } from "arc";
import * as arcActions from "../../actions/arcActions";
import { showNotification } from "../../reducers/notifications";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import gql from "graphql-tag";
import Analytics from "lib/analytics";
import { Page } from "pages";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
// import * as InfiniteScroll from "react-infinite-scroll-component";
import { /* Link, */ RouteComponentProps } from "react-router-dom";
// import * as Sticky from "react-stickynode";
import { first } from "rxjs/operators";
// import ProposalHistoryRow from "../Proposal/ProposalHistoryRow";
import * as css from "./Dao.scss";
import { IRootState } from "reducers";
import { connect } from "react-redux";

const PAGE_SIZE = 50;

interface IExternalProps extends RouteComponentProps<any> {
  currentAccountAddress: Address;
  daoState: IDAOState;
}

interface IStateProps {
  currentAccountAddress: String;
}

interface IFormValues {
  nativeTokenReward: number;
  [key: string]: any;
}

interface IDispatchProps {
  createProposal: typeof arcActions.createProposal;
  showNotification: typeof showNotification;
}

type SubscriptionData = Proposal[];
type IProps = IExternalProps & IDispatchProps & ISubscriptionProps<SubscriptionData>;

const mapDispatchToProps = {
  createProposal: arcActions.createProposal,
  showNotification,
};

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IStateProps => {
  return {...ownProps,
    currentAccountAddress: state.web3.currentAccountAddress,
  };
};


class DaoHistoryPage extends React.Component<IProps, null> {



  public componentDidMount() {
    console.log("HISTORY componentDidMount <<<<<<<<<<<==============================")



    Analytics.track("Page View", {
      "Page Name": Page.DAOHistory,
      "DAO Address": "0xF51773c2b907317E29C7a091a3a3F6F444135D12",
      "DAO Name": this.props.daoState.name,
    });
  }
  public handleSubmit = async (values: IFormValues, { _setSubmitting }: any ): Promise<void> => {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) {
      return;
    }
    const arc = getArc();
    const reputationContractAbi = [ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "Lock", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_beneficiary", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Release", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lockers", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "releaseTime", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minLockingPeriod", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "sgtToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalLocked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "release", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "lock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "contract IERC20", "name": "_sgtToken", "type": "address" }, { "internalType": "uint256", "name": "_minLockingPeriod", "type": "uint256" } ], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];

    const reputationContract = new arc.web3.eth.Contract(reputationContractAbi, "0x7fFf4Ad36d27EbcaFFe253057ECbba4fd63Cc534");
    // Get the contract ABI from compiled smart contract json
    const erc20TokenContractAbi = [ { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }, { "internalType": "uint256", "name": "_cap", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "cap", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" } ], "name": "decreaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" } ], "name": "increaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "isOwner", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "mint", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];

    // Create contract object
    const tokenContract = new arc.web3.eth.Contract(erc20TokenContractAbi, '0x320A0Dc0EE38D30f617C0bc697AdA423c7Be7832');

    // Instantiate contract    
    const toAddress = '0x7fFf4Ad36d27EbcaFFe253057ECbba4fd63Cc534';

    // Calculate contract compatible value for approve with proper decimal points using BigNumber
    const tokenDecimals = arc.web3.utils.toBN(18);
    const tokenAmountToApprove = arc.web3.utils.toBN(values.nativeTokenReward);
    const calculatedApproveValue = arc.web3.utils.toHex(tokenAmountToApprove.mul(arc.web3.utils.toBN(10).pow(tokenDecimals)));

    const currentAccountAddress = this.props.currentAccountAddress;

    // Get user account wallet address first
    tokenContract.methods.approve(toAddress, calculatedApproveValue).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
      if (error) throw error;
    }).then(function () {
      reputationContract.methods.lock(calculatedApproveValue, /* min locking period */ 700000).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
        if (error) throw error;
      });
    });
  }

  public render(): RenderOutput {
    // const { data, hasMoreToLoad, fetchMore, daoState, currentAccountAddress } = this.props;

    // console.log("HISTORY render <<<<<<<<<<<==============================", this.props)


    // const proposals = data;

    // const proposalsHTML = proposals.map((proposal: Proposal) => {
    //   return (<ProposalHistoryRow key={"proposal_" + proposal.id} history={this.props.history} proposal={proposal} daoState={daoState} currentAccountAddress={currentAccountAddress} />);
    // });

    return(
      <div className={css.Membership}>
        <BreadcrumbsItem to={"/dao/history"}>History</BreadcrumbsItem>

        {/* <Sticky enabled top={50} innerZ={10000}> */}
          {/* <h2 className={css.daoHistoryHeader}>
            Membership
          </h2> */}
        {/* </Sticky> */}

        <div>
        { /* create membership control here */ }







          <div className={css.MembershipBlock}>
            <div className={css.icon}>
              <img src="/assets/images/Icon/dash_holdings.png" />
            </div>
            <h2>Membership fee</h2>
            <p>The amount of SNGLS needed to stake in the DAO <br/>so you don't have to pay the transaction fee.</p>

            <h5>Min amount required: <strong>9.85</strong></h5>

            <hr/>

            <div className={css.content}>
              <p>Confirm auto <strong>(9.85)</strong> or enter the amount manually:</p>
              <div className={css.bigInput}>
                <form action="">
                  <label>SNGLS</label>
                  <input type="text" max="7" />
                  <button>auto</button>
                </form>
                <div className={css.bigInputFoot}>
                  <span>Already staked: 0.00</span>
                  <span>Balance: 5.564 SNGLS</span>
                </div>
                <hr />
              </div>
              <button className={css.submit}>Stake</button>
              <button className={css.unstake}>unstake</button>
            </div>

          </div>




{/* v2 */}


          {/* <div className={css.MembershipBlock}>
            <div className={css.MembershipBlockHead}>
                <div className={css.icon}>
                    <img src="/assets/images/Icon/dash_holdings.png" />
                </div>
                <div>
                    <h2>Membership fee</h2>
                    <p>The amount of SNGLS needed to stake in the DAO <br />so you don't have to pay the transaction fee.</p>

                    <p>Min amount required: <strong>9.85</strong></p>
                </div>
            </div>
            <hr />

            <div className={css.content}>
              <p>Confirm auto <strong>(9.85)</strong> or enter the amount manually:</p>
              <div className={css.bigInput}>
                <form action="">
                  <label>SNGLS</label>
                  <input type="text" max="7" className={css.white} />
                    <button className={css.disable}>auto</button>
                </form>
                <div className={css.bigInputFoot}>
                  <span>Already staked: 0.00</span>
                  <span>Balance: 5.564 SNGLS</span>
                </div>
                <hr />
              </div>
              <button className={css.submit}>Stake</button>
              <button className={css.unstake}>unstake</button>
            </div>

          </div> */}
        </div>
        
      </div>
    );
  }
}

const SubscribedCreateContributionRewardExProposal = withSubscription({
  wrappedComponent: DaoHistoryPage,
  loadingComponent: <Loading/>,
  errorComponent: (props) => <div>{ props.error.message }</div>,

  checkForUpdate: [],

  createObservable: async (props: IExternalProps) => {
    const arc = getArc();
    const dao = props.daoState.dao;

    // this query will fetch al data we need before rendering the page, so we avoid hitting the server
    // with all separate queries for votes and stakes and stuff...
    let voterClause = "";
    let stakerClause = "";
    if (props.currentAccountAddress) {
      voterClause = `(where: { voter: "${props.currentAccountAddress}"})`;
      stakerClause = `(where: { staker: "${props.currentAccountAddress}"})`;

    }
    const prefetchQuery = gql`
      query prefetchProposalDataForDAOHistory {
        proposals (
          first: ${PAGE_SIZE}
          skip: 0
          orderBy: "closingAt"
          orderDirection: "desc"
          where: {
            dao: "${"0xF51773c2b907317E29C7a091a3a3F6F444135D12"}"
            stage_in: [
              "${IProposalStage[IProposalStage.ExpiredInQueue]}",
              "${IProposalStage[IProposalStage.Executed]}",
              "${IProposalStage[IProposalStage.Queued]}"
            ]
            closingAt_lte: "${Math.floor(new Date().getTime() / 1000)}"
          }
        ){
          ...ProposalFields
          votes ${voterClause} {
            ...VoteFields
          }
          stakes ${stakerClause} {
            ...StakeFields
          }
        }
      }
      ${Proposal.fragments.ProposalFields}
      ${Vote.fragments.VoteFields}
      ${Stake.fragments.StakeFields}
      ${Scheme.fragments.SchemeFields}
    `;
    await arc.getObservable(prefetchQuery, { subscribe: true }).pipe(first()).toPromise();
    return dao.proposals({
      where: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        stage_in: [IProposalStage.ExpiredInQueue, IProposalStage.Executed, IProposalStage.Queued],
        // eslint-disable-next-line @typescript-eslint/camelcase
        closingAt_lte: Math.floor(new Date().getTime() / 1000),
      },
      orderBy: "closingAt",
      orderDirection: "desc",
      first: PAGE_SIZE,
      skip: 0,
    }, { fetchAllData: true } // get and subscribe to all data, so that subcomponents do nto have to send separate queries
    );
  },

  // used for hacky pagination tracking
  pageSize: PAGE_SIZE,

  getFetchMoreObservable: (props: IExternalProps, data: SubscriptionData) => {
    const dao = props.daoState.dao;
    return dao.proposals({
      where: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        stage_in: [IProposalStage.ExpiredInQueue, IProposalStage.Executed, IProposalStage.Queued],
        // eslint-disable-next-line @typescript-eslint/camelcase
        closingAt_lte: Math.floor(new Date().getTime() / 1000),
      },
      orderBy: "closingAt",
      orderDirection: "desc",
      first: PAGE_SIZE,
      skip: data.length,
    }, { fetchAllData: true } // get and subscribe to all data, so that subcomponents do nto have to send separate queries
    );
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(SubscribedCreateContributionRewardExProposal);