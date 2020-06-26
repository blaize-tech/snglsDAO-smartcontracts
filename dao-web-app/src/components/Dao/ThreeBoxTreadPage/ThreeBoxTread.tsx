import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getConfig, getProfile } from '3box';

import Loading from "components/Shared/Loading";
import ThreeBoxMessageList from "./ThreeBoxMessageList"
import ThreeBoxAddMessage from "./ThreeBoxAddMessage"
import { IProfileState } from "reducers/profilesReducer";

interface IProps {
  currentAccountAddress: string;
  threeBox?: any;
  web3Provider?: any;
  chatName: string;
  currentAccountProfile: IProfileState;
}

const ThreeBoxTread = ({ currentAccountAddress, threeBox, chatName, web3Provider }: IProps) => {

  const [thread, setThread] = useState(null)
  const [currDID, setCurrDID] = useState(null)
  const [currProfile, setCurrProfile] = useState(null)
  const [currConfig, setCurrConfig] = useState(null)

  useEffect(() => {
    onGetCurrUser()
  }, [])

  useEffect(() => {
    threeBox && openTread()
  }, [threeBox])

  const openTread = async () => {
    const currDID = await threeBox.DID
    setCurrDID(currDID)
    await threeBox.auth(['treads', chatName], { address: currentAccountAddress });
    const thread = await threeBox.openThread("treads", chatName,
      {
        //TODO add moderator address
        firstModerator: '0x4fbea1becd2f3f24dcbdd59b2b609abcdcdd6956'
      })
    setThread(thread)
  }

  const onGetCurrUser = async () => {
    const resConfig = await getConfig(currentAccountAddress)
    const resProfile = await getProfile(currentAccountAddress)
    setCurrConfig(resConfig)
    setCurrProfile(resProfile)
  }


  return(
    <div>
      {!web3Provider
        ? <h3>Please connect to wallet</h3>
        : !threeBox
          ? <Loading />
          : (<div>
            <ThreeBoxAddMessage profile={currProfile} thread={thread} currentAddress={currentAccountAddress} />
            <ThreeBoxMessageList currDID={currDID} currConfig={currConfig} thread={thread}/>
          </div>)}
    </div>
  );
}

// @ts-ignore
export default connect(({profiles: {  threeBox}} ) => ({threeBox}))(ThreeBoxTread)