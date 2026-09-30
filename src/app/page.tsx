'use client'
import { createElement as h, useState } from 'react'
import { useMeQuery } from '@/features/auth'
import { usePlayerProfileQuery } from '@/features/player'
import { useResourcesQuery } from '@/features/economy/api/economy'
import { useCityQuery, useUpgradeBuildingMutation, useFinishBuildingMutation } from '@/features/city/api/city'
import { useArmyQuery, useArmyCatalogQuery, useRecruitMutation, useCompleteTrainingMutation } from '@/features/army/api/army'
import { useWorldMap } from '@/features/world/api/world'
import { BUILDING_ICONS } from '@/features/city/types'
const box={padding:12,borderRadius:10,background:'#171a22'}
const money=(v:string|number)=>Number(v).toLocaleString('en-US')
const el=(tag:string,props:any,...kids:any[])=>h(tag,props,...kids)
export default function Page(){
 const me=useMeQuery(), ok=Boolean(me.data), profile=usePlayerProfileQuery({enabled:ok}), resources=useResourcesQuery({enabled:ok}), city=useCityQuery({enabled:ok}), army=useArmyQuery({enabled:ok}), catalog=useArmyCatalogQuery({enabled:ok}), world=useWorldMap({enabled:ok})
 const upgrade=useUpgradeBuildingMutation(), finish=useFinishBuildingMutation(), recruit=useRecruitMutation(), complete=useCompleteTrainingMutation(); const [tab,setTab]=useState('city')
 if(me.isPending)return el('main',{className:'war-game'},'Loading WARLORDS…')
 if(!me.data)return el('main',{className:'war-game'},el('h1',null,'⚔️ WARLORDS'),el('p',null,'Open this Mini App from the Telegram bot to sign in.'),el('p',null,'Session unavailable. Reopen the game from Telegram.'))
 const nav=['city','army','world'].map(t=>el('button',{key:t,onClick:()=>setTab(t),style:{flex:1,padding:10,border:0,borderRadius:8,background:tab===t?'#d09a2d':'#252936',color:'#fff'}},t==='city'?'🏰 City':t==='army'?'⚔️ Army':'🗺️ World'))
 let body:any
 if(tab==='city')body=el('section',null,el('h2',null,'🏰 ',city.data?.city.name||'City'),el('p',null,'Coordinates: ',city.data?.city.x,',',city.data?.city.y),el('div',{style:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}},...(city.data?.buildings||[]).map(b=>el('article',{key:b.id,style:box},el('b',null,(BUILDING_ICONS[b.type]||'🏗️')+' '+b.name),el('p',null,'Level ',b.level,'/',b.maxLevel,' · ',b.status),b.status==='COMPLETABLE'?el('button',{onClick:()=>finish.mutate(b.type)},'Finish'):b.nextUpgrade?.requirementsMet?el('button',{onClick:()=>upgrade.mutate(b.type)},'Upgrade'):el('small',null,'Requirements not met'))))
 if(tab==='army')body=el('section',null,el('h2',null,'⚔️ Army'),el('p',null,(army.data?.totals.unitCount||0)+' soldiers'),el('h3',null,'Train units'),...(catalog.data?.units||[]).map(u=>el('div',{key:u.id,style:{...box,marginBottom:6,display:'flex',justifyContent:'space-between'}},el('span',null,u.name,' · ',money(u.trainingCost.GOLD||0),' gold'),el('button',{onClick:()=>recruit.mutate({unitId:u.id,count:1})},'Train 1'))),el('h3',null,'Queue'),...(army.data?.training.queue||[]).map(q=>el('p',{key:q.id},'⏳ ',q.unitName,' ×',q.count,' · ',q.status,q.status==='COMPLETABLE'?el('button',{onClick:()=>complete.mutate(q.id)},'Complete'):null)))
 if(tab==='world')body=el('section',null,el('h2',null,'🗺️ World Map'),el('p',null,'Tap a territory to inspect it.'),world.data?el('div',{style:{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:3,maxWidth:480}},...world.data.territories.map(c=>el('button',{key:c.id,title:(c.name||c.type)+' '+c.x+','+c.y,onClick:()=>setTab('world'),style:{aspectRatio:'1',border:'1px solid #555',borderRadius:4,background:c.status==='CONTROLLED'?'#d09a2d':c.status==='LOCKED'?'#252936':'#314b45',color:'#fff'}},c.isCapital?'⌂':c.ownerType==='PLAYER'?'◆':''))):el('p',null,'Loading map…'))
 return el('main',{className:'war-game',style:{maxWidth:760,margin:'0 auto',padding:16,fontFamily:'system-ui'}},el('header',{style:{display:'flex',justifyContent:'space-between',marginBottom:12}},el('div',null,el('h1',{style:{margin:0}},'⚔️ WARLORDS'),el('p',{style:{opacity:.7}},'Commander: ',me.data.player?.name)),el('strong',null,'Lv ',profile.data?.level||1,' · ⚡ ',profile.data?.power||0)),el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}},...(resources.data?.resources||[]).map(r=>el('div',{key:r.key,style:box},el('small',null,r.key),el('br'),el('b',null,money(r.balance)))),el('nav',{style:{display:'flex',gap:8,marginBottom:14}},...nav),body)
}
