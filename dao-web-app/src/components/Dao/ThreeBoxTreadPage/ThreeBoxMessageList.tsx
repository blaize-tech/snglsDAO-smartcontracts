import * as React from "react";
import { useEffect, useState, useCallback} from "react";
import { List, Skeleton } from "antd";

import ThreeBoxMessageItem from "./ThreeBoxMessageItem"


interface ThreeBoxMessageListProps {
  thread: any;
  currDID: string;
  currConfig: any;
}

let isSubscribed = true

const ThreeBoxMessageList =({ thread, currDID, currConfig }: ThreeBoxMessageListProps) =>{

  const [messages, setMessages] =useState(null);
  const [moderators, setModerators] =useState(null);

  useEffect(()=>{
    isSubscribed = true
    if(thread) {
      onGetPosts();
      onGetListModerators();
      thread.onUpdate(onGetPosts);
      return () => isSubscribed = false
    }
  }, [thread]);

  const onGetPosts = async() => {
    const res = await thread.getPosts();
    isSubscribed && setMessages(res);
  };

  const onGetListModerators = async() => {
    const res = await thread.listModerators();
    isSubscribed && setModerators(res);
  };

  const handleRemoveMessage = useCallback(async (postId: string) => {
    await thread.deletePost(postId);
  }, [thread]);

  return messages
    ? (  <List
        dataSource={messages}
        itemLayout="horizontal"
        renderItem={props => {
          return(
            // @ts-ignore
            <ThreeBoxMessageItem currDID={currDID}
                                 isModerator={moderators?.some((i: string) => i === currConfig?.spaces.treads.DID) || false}
              // @ts-ignore
                                 key={props.postId}
                                 onRemoveMessage={handleRemoveMessage}
                                 {...props} />
          )
        }}
      />)
    :(<Skeleton avatar />)
}

export default ThreeBoxMessageList
