import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Position,
  ConnectionMode,
  Connection,
  MarkerType,
  NodeProps,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import ButtonEdge from './ButtonEdge';
import SelfConnectingEdge from './SelfConnectingEdge';
import BiDirectionalEdge from './BiDirectionalEdge';
import BiDirectionalNode from './BiDirectionalNode';
import { workflowData, initialNodes, initialEdges } from './workflowData'
import { appModule2FlowEdge, appModule2FlowNode } from 'src/functions/utils/adapt';
import { ModuleItemType } from 'src/functions/core/module/type.d';

import { useToast } from 'src/functions/web/hooks/useToast';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { EDGE_TYPE, FlowNodeTypeEnum } from 'src/functions/core/module/node/constant';
import { FlowModuleItemType } from 'src/functions/core/module/type';

const edgeTypes1 = {
  bidirectional: BiDirectionalEdge,
  selfconnecting: SelfConnectingEdge,
  buttonedge: ButtonEdge,
};

const nodeTypes1 = {
  bidirectional: BiDirectionalNode,
};

const NodeSimple = dynamic(() => import('src/views/workflow/components/nodes/NodeSimple'));
const nodeTypes: Record<`${FlowNodeTypeEnum}`, any> = {
  [FlowNodeTypeEnum.userGuide]: dynamic(() => import('src/views/workflow/components/nodes/NodeUserGuide')),
  [FlowNodeTypeEnum.questionInput]: dynamic(() => import('src/views/workflow/components/nodes/NodeQuestionInput')),
  [FlowNodeTypeEnum.historyNode]: NodeSimple,
  [FlowNodeTypeEnum.chatNode]: NodeSimple,
  [FlowNodeTypeEnum.datasetSearchNode]: NodeSimple,
  [FlowNodeTypeEnum.datasetConcatNode]: dynamic(
    () => import('./components/nodes/NodeDatasetConcat')
  ),
  [FlowNodeTypeEnum.answerNode]: dynamic(() => import('src/views/workflow/components/nodes/NodeAnswer')),
  [FlowNodeTypeEnum.classifyQuestion]: dynamic(() => import('src/views/workflow/components/nodes/NodeCQNode')),
  [FlowNodeTypeEnum.contentExtract]: dynamic(() => import('src/views/workflow/components/nodes/NodeExtract')),
  [FlowNodeTypeEnum.httpRequest468]: dynamic(() => import('src/views/workflow/components/nodes/NodeHttp')),
  [FlowNodeTypeEnum.httpRequest]: NodeSimple,
  [FlowNodeTypeEnum.runApp]: NodeSimple,
  [FlowNodeTypeEnum.pluginInput]: dynamic(() => import('src/views/workflow/components/nodes/NodePluginInput')),
  [FlowNodeTypeEnum.pluginOutput]: dynamic(() => import('src/views/workflow/components/nodes/NodePluginOutput')),
  [FlowNodeTypeEnum.pluginModule]: NodeSimple,
  [FlowNodeTypeEnum.queryExtension]: NodeSimple,
  [FlowNodeTypeEnum.tools]: dynamic(() => import('src/views/workflow/components/nodes/NodeTools')),
  [FlowNodeTypeEnum.stopTool]: (data: NodeProps<FlowModuleItemType>) => (
    <NodeSimple {...data} minW={'100px'} maxW={'300px'} />
  )
};

const edgeTypes = {
  [EDGE_TYPE]: ButtonEdge
};

const EdgesFlow = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const customOnConnect = useCallback(
    (connect: Connection) => {
      if (!connect.sourceHandle || !connect.targetHandle) {
        return;
      }
      if (connect.source === connect.target) {
        return toast({
          status: 'warning',
          title: t('core.module.Can not connect self') as string
        });
      }
      onConnect({
        connect
      });
    },
    [onConnect, t, toast]
  );
 
  useEffect(()=>{
    const modules: ModuleItemType[] = workflowData.modules
    const edges = appModule2FlowEdge({modules})
    setEdges(edges)
    const nodes = modules.map((item: any) => appModule2FlowNode({ item }))
    setNodes(nodes)
    console.log("workflowData", workflowData.modules)
    console.log("edges", edges)
    console.log("nodes", nodes)
  }, [])

  return (
    <ReactFlow
      fitView
      nodes={nodes}
      edges={edges}
      minZoom={0.1}
      maxZoom={1.5}
      defaultEdgeOptions={{
        animated: true,
        zIndex: 0
      }}
      elevateEdgesOnSelect
      connectionLineStyle={{ strokeWidth: 2, stroke: '#5A646Es' }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={customOnConnect}
      attributionPosition="top-right"
      connectionMode={ConnectionMode.Loose}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default EdgesFlow;