import React, { useEffect, useRef, forwardRef } from 'react'

let MindElixir;
import('mind-elixir').then((module) => { MindElixir = module.default; }).catch((error) => { console.error('Failed to import MindElixir:', error.message); MindElixir = null; });

function MindElixirReact(
  { style, data, options, plugins, onOperate, onSelectNode, onExpandNode },
  ref
) {
  const isFirstRun = useRef(true)
  
  useEffect(() => {
    if(MindElixir != null)     {
      isFirstRun.current = true
      const me = new MindElixir({
        el: ref.current,
        ...options,
      })
      for (let i = 0; i < plugins.length; i++) {
        const plugin = plugins[i]
        me.install(plugin)
      }
      me.bus.addListener('operation', (operation) => {
        onOperate(operation)
      })
      me.bus.addListener('selectNode', (operation) => {
        onSelectNode(operation)
      })
      me.bus.addListener('expandNode', (operation) => {
        onExpandNode(operation)
      })
      ref.current.instance = me
      console.log('created', ref.current.instance)
    }
  }, [ref, options, plugins, onOperate, onSelectNode, onExpandNode, MindElixir])

  useEffect(() => {
    if(data != null)  {
      if (isFirstRun.current) {
        if (!ref.current.instance) return
        ref.current.instance.init(data)
        isFirstRun.current = false
        console.log('init', ref.current.instance)
      } else {
        ref.current.instance.refresh(data)
        console.log('refresh', ref.current.instance)
      }
    }
  }, [ref, options, data])
  console.log('render')
  
  return <div ref={ref} style={style}></div>
}

export default forwardRef(MindElixirReact)