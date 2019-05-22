import * as React from 'react';
import styled from 'styled-components';

import CenteredWrapper from '../components/CenteredWrapper';
import CenteredTitle from '../components/CenteredTitle';
import SectionLabel from '../components/SectionLabel';
import { Separator } from '../components/Separator';
import Actions from '../components/Actions';
import { StatelessPage, IMainContext, IEthereumContext } from '../interfaces';
import { EthereumContext } from '../components/EthereumProvider';
import { MainContext } from '../components/MainProvider';
import { sendAndWaitForTransaction } from '../utils/transaction';
import { NotificationsContext } from '../components/NotificationsProvider';

const CenteredSection = styled.div`
  padding: 2rem;
`;

const SectionDialog = styled.div`
  margin-bottom: 2rem;
  line-height: 1.5;
`;

interface IProps {
  query: any;
  asPath: string;
}

const Withdraw: StatelessPage<IProps> = ({ query, asPath }) => {
  const { slates, onRefreshSlates, slatesByID, proposalsByID }: IMainContext = React.useContext(
    MainContext
  );
  const {
    account,
    contracts,
    votingRights,
    ethProvider,
    onRefreshBalances,
  }: IEthereumContext = React.useContext(EthereumContext);
  const { onHandleGetUnreadNotifications } = React.useContext(NotificationsContext);

  const slate = (slates as any[]).find(s => s.id === parseInt(query.id));

  async function handleWithdraw() {
    try {
      if (account && ethProvider && contracts && slatesByID && proposalsByID) {
        // console.log('slates:', slates);
        // console.log('query:', query);
        // console.log('asPath:', asPath);
        // console.log('slate:', slate);
        if (asPath.includes('voting')) {
          await sendAndWaitForTransaction(ethProvider, contracts.gatekeeper, 'withdrawVoteTokens', [
            votingRights,
          ]);
        } else if (asPath.includes('stake')) {
          await sendAndWaitForTransaction(ethProvider, contracts.gatekeeper, 'withdrawStake', [
            slate.id,
          ]);
        } else if (asPath.includes('grant')) {
          await sendAndWaitForTransaction(ethProvider, contracts.tokenCapacitor, 'withdrawTokens', [
            query.id,
          ]);
        } else {
          console.log('Invalid asPath', asPath);
        }
        onRefreshBalances();
        onRefreshSlates();
        onHandleGetUnreadNotifications(account, slatesByID, proposalsByID);
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <>
      <CenteredTitle title="Withdraw Tokens" />
      <CenteredWrapper>
        <CenteredSection>
          <SectionLabel>HOW WITHDRAWING TOKENS WORKS</SectionLabel>
          <SectionDialog>
            The tokens you previously deposited for voting on the ballot can be withdrawn. Upon
            selecting Confirm and Withdraw, you'll be prompted to confirm in you MetaMask wallet.
          </SectionDialog>
          <SectionDialog>
            Contact us at <a href="mailto:help@panvala.com">help@panvala.com</a> if you have any
            questions.
          </SectionDialog>
        </CenteredSection>

        <Separator />
        <Actions
          handleClick={handleWithdraw}
          handleBack={null}
          actionText={'Confirm and Withdraw'}
        />
      </CenteredWrapper>
    </>
  );
};

Withdraw.getInitialProps = async ({ query, asPath }) => {
  return { query, asPath };
};

export default Withdraw;