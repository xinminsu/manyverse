// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {withXstreamProps} from 'react-xstream-hoc';
import {Msg, FeedId, GatheringContent, AboutContent} from 'ssb-typescript';
import {isPostMsg, isContactMsg, isAboutMsg} from 'ssb-typescript/utils';
import {
  Reactions,
  MsgAndExtras,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '~frontend/ssb/types';
import RawMessage from './RawMessage';
import PostMessage from './PostMessage';
import AboutMessage from './AboutMessage';
import ContactMessage from './ContactMessage';
import KeylessMessage from './KeylessMessage';
import GatheringMessage from './GatheringMessage';

export interface Props {
  msg: MsgAndExtras;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  expandCW?: boolean;
  replyCount?: number;
  webFocusHack?: boolean;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressReply?: () => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
}

interface State {
  hasError: boolean;
}

const RawMessage$ = withXstreamProps(RawMessage, 'reactions');
const PostMessage$ = withXstreamProps(PostMessage, 'reactions');
const ContactMessage$ = withXstreamProps(ContactMessage, 'reactions');
const GatheringMessage$ = withXstreamProps(
  GatheringMessage,
  'reactions',
  'gatheringInfo',
);

// TODO move this to ssb-typescript
export function isGatheringMsg(msg: Msg<any>): msg is Msg<GatheringContent> {
  return msg?.value?.content?.type === 'gathering';
}

export default class Message extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  public componentDidCatch(error: any, info: any) {
    console.warn('Message componentDidCatch');
    this.setState(() => ({hasError: true}));
  }

  public render() {
    const {msg, replyCount} = this.props;
    const metadata = msg.value._$manyverse$metadata;
    const reactions = (
      metadata.reactions ?? (xs.never() as Stream<Reactions>)
    ).compose(debounce(80)); // avoid DB reads flickering
    const gatheringInfo = (
      metadata.gatheringInfo ?? (xs.never() as Stream<Msg<AboutContent>[]>)
    ).compose(debounce(80)); // avoid DB reads flickering
    const props = {
      ...this.props,
      msg: msg as Msg<any>,
      reactions,
      replyCount: replyCount ?? 0,
      name: metadata.about.name,
      imageUrl: metadata.about.imageUrl,
      contactName: metadata.contact ? metadata.contact.name : undefined,
    };

    if (this.state.hasError) return h(RawMessage$, props);
    if (!msg.key) return h(KeylessMessage, props);
    if (isGatheringMsg(msg))
      return h(GatheringMessage$, {...props, gatheringInfo});
    if (isPostMsg(msg)) return h(PostMessage$, props);
    if (isAboutMsg(msg)) return h(AboutMessage, props);
    if (isContactMsg(msg)) return h(ContactMessage$, props);
    return h(RawMessage$, props);
  }
}
