import React, { useCallback } from 'react';
import type { RenderInputProps } from '../type';
import { onChangeNode } from '../../../../FlowProvider';
import { SettingAIDataType } from 'src/functions/core/module/node/type';
import SettingLLMModel from 'src/components/core/ai/SettingLLMModel';
import { ModuleInputKeyEnum } from 'src/functions/core/module/constants';

const SelectAiModelRender = ({ item, inputs = [], moduleId }: RenderInputProps) => {
  const onChangeModel = useCallback(
    (e: SettingAIDataType) => {
      for (const key in e) {
        const input = inputs.find((input) => input.key === key);
        input &&
          onChangeNode({
            moduleId,
            type: 'updateInput',
            key,
            value: {
              ...input,
              // @ts-ignore
              value: e[key]
            }
          });
      }
    },
    [inputs, moduleId]
  );

  const llmModelData: SettingAIDataType = {
    model: inputs.find((input) => input.key === ModuleInputKeyEnum.aiModel)?.value ?? '',
    maxToken:
      inputs.find((input) => input.key === ModuleInputKeyEnum.aiChatMaxToken)?.value ?? 2048,
    temperature:
      inputs.find((input) => input.key === ModuleInputKeyEnum.aiChatTemperature)?.value ?? 1,
    isResponseAnswerText: inputs.find(
      (input) => input.key === ModuleInputKeyEnum.aiChatIsResponseText
    )?.value
  };

  return (
    <SettingLLMModel
      llmModelType={item.llmModelType}
      defaultData={llmModelData}
      onChange={onChangeModel}
    />
  );
};

export default React.memo(SelectAiModelRender);
