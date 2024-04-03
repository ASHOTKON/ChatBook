import { FlowNodeInputTypeEnum, FlowNodeTypeEnum } from '../../node/constant';
import { FlowNodeTemplateType } from '../../type.d';
import { userGuideTip } from '../tip';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';

export const UserGuideModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.userGuide,
  templateType: FlowNodeTemplateTypeEnum.userGuide,
  flowType: FlowNodeTypeEnum.userGuide,
  avatar: '/imgs/module/userGuide.png',
  name: '全局配置',
  intro: userGuideTip,
  inputs: [
    {
      key: ModuleInputKeyEnum.welcomeText,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.string,
      label: 'core.app.Welcome Text',
      showTargetInApp: false,
      showTargetInPlugin: false
    },
    {
      key: ModuleInputKeyEnum.variables,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.any,
      label: 'core.module.Variable',
      value: [],
      showTargetInApp: false,
      showTargetInPlugin: false
    },
    {
      key: ModuleInputKeyEnum.questionGuide,
      valueType: ModuleIOValueTypeEnum.boolean,
      type: FlowNodeInputTypeEnum.switch,
      label: '',
      showTargetInApp: false,
      showTargetInPlugin: false
    },
    {
      key: ModuleInputKeyEnum.tts,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.any,
      label: '',
      showTargetInApp: false,
      showTargetInPlugin: false
    }
  ],
  outputs: []
};
