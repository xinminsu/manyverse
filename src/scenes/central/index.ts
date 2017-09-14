/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {ScreenSource} from '@cycle/native-screen';
import {StateSource, Reducer} from 'cycle-onionify';
import {Content} from '../../ssb/types';
import {SSBSource} from '../../drivers/ssb';
import {ScreenVNode, Command, PushCommand} from '../../drivers/navigation';
import {publicTab} from '../public-tab/index';
import {syncTab} from '../sync-tab/index';
import {navigatorStyle as profileNavigatorStyle} from '../profile/styles';
import intent, {Actions} from './intent';
import view from './view';

export type Sources = {
  screen: ScreenSource;
  onion: StateSource<any>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<any>>;
  ssb: Stream<Content>;
};

function navigationCommands(
  actions: Actions,
  other$: Stream<Command>
): Stream<Command> {
  const centralCommand$: Stream<Command> = actions.goToSelfProfile.mapTo(
    {
      type: 'push',
      screen: 'mmmmm.Profile',
      navigatorStyle: profileNavigatorStyle,
      animated: true,
      animationType: 'slide-horizontal'
    } as PushCommand
  );

  return xs.merge(centralCommand$, other$);
}

export function central(sources: Sources): Sinks {
  const publicTabSinks = publicTab(sources);
  const syncTabSinks = syncTab(sources);

  const actions = intent(sources.screen);
  const command$ = navigationCommands(actions, publicTabSinks.navCommand);

  const {vdom$, statusBar$} = view(publicTabSinks.screen, syncTabSinks.screen);
  const reducer$ = xs.empty();

  return {
    screen: vdom$,
    onion: xs.never(),
    navCommand: command$,
    ssb: publicTabSinks.ssb
  };
}
