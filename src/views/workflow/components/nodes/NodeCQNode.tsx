import React, { useMemo } from 'react';
import { NodeProps } from 'reactflow';
import { Box, Button, Flex, Textarea } from '@chakra-ui/react';
import NodeCard from '../render/NodeCard';
import { FlowModuleItemType } from 'src/functions/temp/core/module/type.d';
import Divider from '../modules/Divider';
import Container from '../modules/Container';
import RenderInput from '../render/RenderInput';
import type { ClassifyQuestionAgentItemType } from 'src/functions/temp/core/module/type.d';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 4);
import MyIcon from 'src/functions/temp/web/components/common/Icon';
import { FlowNodeOutputTypeEnum } from 'src/functions/temp/core/module/node/constant';
import { ModuleIOValueTypeEnum, ModuleInputKeyEnum } from 'src/functions/temp/core/module/constants';
import { useTranslation } from 'next-i18next';
import SourceHandle from '../render/SourceHandle';
import MyTooltip from 'src/components/MyTooltip';
import { onChangeNode } from '../../FlowProvider';
import { FlowNodeInputItemType } from 'src/functions/temp/core/module/node/type';

const NodeCQNode = ({ data, selected }: NodeProps<FlowModuleItemType>) => {
  const { t } = useTranslation();
  const { moduleId, inputs } = data;

  const CustomComponent = useMemo(
    () => ({
      [ModuleInputKeyEnum.agents]: ({
        key: agentKey,
        value = [],
        ...props
      }: FlowNodeInputItemType) => {
        const agents = value as ClassifyQuestionAgentItemType[];
        return (
          <Box>
            {agents.map((item, i) => (
              <Box key={item.key} mb={4}>
                <Flex alignItems={'center'}>
                  <MyTooltip label={t('common.Delete')}>
                    <MyIcon
                      mt={1}
                      mr={2}
                      name={'minus'}
                      w={'14px'}
                      cursor={'pointer'}
                      color={'myGray.600'}
                      _hover={{ color: 'red.600' }}
                      onClick={() => {
                        onChangeNode({
                          moduleId,
                          type: 'updateInput',
                          key: agentKey,
                          value: {
                            ...props,
                            key: agentKey,
                            value: agents.filter((input) => input.key !== item.key)
                          }
                        });
                        onChangeNode({
                          moduleId,
                          type: 'delOutput',
                          key: item.key
                        });
                      }}
                    />
                  </MyTooltip>
                  <Box flex={1}>分类{i + 1}</Box>
                </Flex>
                <Box position={'relative'}>
                  <Textarea
                    rows={2}
                    mt={1}
                    defaultValue={item.value}
                    onChange={(e) => {
                      const newVal = agents.map((val) =>
                        val.key === item.key
                          ? {
                              ...val,
                              value: e.target.value
                            }
                          : val
                      );
                      onChangeNode({
                        moduleId,
                        type: 'updateInput',
                        key: agentKey,
                        value: {
                          ...props,
                          key: agentKey,
                          value: newVal
                        }
                      });
                    }}
                  />
                  <SourceHandle handleKey={item.key} valueType={ModuleIOValueTypeEnum.boolean} />
                </Box>
              </Box>
            ))}
            <Button
              onClick={() => {
                const key = nanoid();

                onChangeNode({
                  moduleId,
                  type: 'updateInput',
                  key: agentKey,
                  value: {
                    ...props,
                    key: agentKey,
                    value: agents.concat({ value: '', key })
                  }
                });

                onChangeNode({
                  moduleId,
                  type: 'addOutput',
                  value: {
                    key,
                    label: '',
                    type: FlowNodeOutputTypeEnum.hidden,
                    targets: []
                  }
                });
              }}
            >
              {t('core.module.Add question type')}
            </Button>
          </Box>
        );
      }
    }),
    [moduleId, t]
  );

  return (
    <NodeCard minW={'400px'} selected={selected} {...data}>
      <Divider text={t('common.Input')} />
      <Container>
        <RenderInput moduleId={moduleId} flowInputList={inputs} CustomComponent={CustomComponent} />
      </Container>
    </NodeCard>
  );
};
export default React.memo(NodeCQNode);
