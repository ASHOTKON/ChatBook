import type { FlowNodeOutputItemType } from 'src/functions/workflow/type.d';
import { ModuleOutputKeyEnum } from 'src/functions/workflow/constants';
import { FlowNodeOutputTypeEnum } from 'src/functions/workflow/constants';
import { ModuleIOValueTypeEnum } from 'src/functions/workflow/constants';

export const Output_Template_UserChatInput: FlowNodeOutputItemType = {
  key: ModuleOutputKeyEnum.userChatInput,
  label: 'core.module.input.label.user question',
  type: FlowNodeOutputTypeEnum.hidden,
  valueType: ModuleIOValueTypeEnum.string,
  targets: []
};

export const Output_Template_Finish: FlowNodeOutputItemType = {
  key: ModuleOutputKeyEnum.finish,
  label: '',
  description: '',
  valueType: ModuleIOValueTypeEnum.boolean,
  type: FlowNodeOutputTypeEnum.hidden,
  targets: []
};

export const Output_Template_AddOutput: FlowNodeOutputItemType = {
  key: ModuleOutputKeyEnum.addOutputParam,
  type: FlowNodeOutputTypeEnum.addOutputParam,
  valueType: ModuleIOValueTypeEnum.any,
  label: '',
  targets: []
};