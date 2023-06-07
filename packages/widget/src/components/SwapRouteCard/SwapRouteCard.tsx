import type { TokenAmount } from '@lifi/sdk';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import type { TooltipProps } from '@mui/material';
import { Box, Collapse, Tooltip, Typography } from '@mui/material';
import type { MouseEventHandler } from 'react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWidgetConfig } from '../../providers';
import { formatTokenAmount } from '../../utils';
import type { CardProps } from '../Card';
import { Card, CardIconButton, CardLabel, CardLabelTypography } from '../Card';
import type { InsuredAmount } from '../Insurance';
import { StepActions } from '../StepActions';
import { Token } from '../Token';
import { SwapRouteCardEssentials } from './SwapRouteCardEssentials';
import type { SwapRouteCardProps } from './types';

export const SwapRouteCard: React.FC<
  SwapRouteCardProps & Omit<CardProps, 'variant'>
> = ({ route, active, variant = 'default', expanded, ...other }) => {
  const { t } = useTranslation();
  const { variant: widgetVariant } = useWidgetConfig();
  const [cardExpanded, setCardExpanded] = useState(expanded);
  const insurable = route.insurance?.state === 'INSURABLE';

  const handleExpand: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setCardExpanded((expanded) => !expanded);
  };

  const token: TokenAmount =
    widgetVariant === 'nft'
      ? { ...route.fromToken, amount: route.fromAmount }
      : { ...route.toToken, amount: route.toAmount };

  const RecommendedTagTooltip =
    route.tags?.[0] === 'RECOMMENDED' ? RecommendedTooltip : Fragment;

  const cardContent = (
    <Box flex={1}>
      {widgetVariant !== 'refuel' && (insurable || route.tags?.length) ? (
        <Box display="flex" alignItems="center" mb={2}>
          {insurable ? (
            <InsuranceTooltip
              insuredAmount={formatTokenAmount(
                route.toAmountMin,
                route.toToken.decimals,
              )}
              insuredTokenSymbol={route.toToken.symbol}
            >
              <CardLabel
                type={
                  route.tags?.length && !cardExpanded
                    ? 'insurance-icon'
                    : 'insurance'
                }
              >
                <VerifiedUserIcon fontSize="inherit" />
                {cardExpanded || !route.tags?.length ? (
                  <CardLabelTypography type="icon">
                    {t(`swap.tags.insurable`)}
                  </CardLabelTypography>
                ) : null}
              </CardLabel>
            </InsuranceTooltip>
          ) : null}
          {route.tags?.length ? (
            <RecommendedTagTooltip>
              <CardLabel type={active ? 'active' : undefined}>
                <CardLabelTypography>
                  {t(`swap.tags.${route.tags[0].toLowerCase()}` as any)}
                </CardLabelTypography>
              </CardLabel>
            </RecommendedTagTooltip>
          ) : null}
        </Box>
      ) : null}
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Token
          token={token}
          step={!cardExpanded ? route.steps[0] : undefined}
        />
        {!expanded ? (
          <CardIconButton onClick={handleExpand} size="small">
            {cardExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </CardIconButton>
        ) : null}
      </Box>
      <Collapse timeout={225} in={cardExpanded} mountOnEnter unmountOnExit>
        {route.steps.map((step) => (
          <StepActions key={step.id} step={step} mt={2} />
        ))}
      </Collapse>
      <SwapRouteCardEssentials route={route} />
    </Box>
  );

  return widgetVariant === 'refuel' || variant === 'cardless' ? (
    cardContent
  ) : (
    <Card
      variant={active ? 'selected' : 'default'}
      selectionColor="secondary"
      indented
      {...other}
    >
      {cardContent}
    </Card>
  );
};

const InsuranceTooltip: React.FC<
  InsuredAmount & Pick<TooltipProps, 'children'>
> = ({ insuredAmount, insuredTokenSymbol, children }) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      title={
        <Box component="span">
          <Typography fontSize={12} fontWeight="500">
            {t('swap.insurance.insure', {
              amount: insuredAmount,
              tokenSymbol: insuredTokenSymbol,
            })}
          </Typography>
          <Box
            sx={{
              listStyleType: 'disc',
              pl: 2,
            }}
          >
            <Typography fontSize={12} fontWeight="500" display="list-item">
              {t('swap.insurance.bridgeExploits')}
            </Typography>
            <Typography fontSize={12} fontWeight="500" display="list-item">
              {t('swap.insurance.slippageError')}
            </Typography>
          </Box>
        </Box>
      }
      placement="top"
      enterDelay={400}
      arrow
    >
      {children}
    </Tooltip>
  );
};

const RecommendedTooltip: React.FC<Pick<TooltipProps, 'children'>> = ({
  children,
}) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      title={t('tooltip.recommended')}
      placement="top"
      enterDelay={400}
      arrow
    >
      {children}
    </Tooltip>
  );
};
