import React, { useState, useEffect } from 'react';
import { Passenger } from '../game/passengers';
import { Station } from '../game/stations';
import { getDialogueTree, getDialogueNode, DialogueNode } from '../data/dialogue';
import HeartStateIndicator from './HeartStateIndicator';

export default function TrainHubView({ passenger, nextStation, impactScore, onDepart, runLog } : { passenger: Passenger | null; nextStation: Station | null; impactScore: number; onDepart: ()=>void; runLog?: string[] }){
  const [dialogueNode, setDialogueNode] = useState<DialogueNode | null>(null);
  const [showDepart, setShowDepart] = useState(false);

  // Load initial crew dialogue
  useEffect(() => {
    if (passenger) {
      const tree = getDialogueTree(passenger.id, 'train_hub');
      if (tree) {
        const rootNode = getDialogueNode(tree, tree.root);
        setDialogueNode(rootNode);
        setShowDepart(!rootNode);
      } else {
        // Not every passenger has train-hub dialogue. Never trap the run.
        setDialogueNode(null);
        setShowDepart(true);
      }
    }
  }, [passenger]);

  const handleContinueDialogue = () => {
    if (dialogueNode?.nextNode) {
      const tree = getDialogueTree(passenger!.id, 'train_hub');
      const nextNode = getDialogueNode(tree!, dialogueNode.nextNode);
      if (nextNode) {
        setDialogueNode(nextNode);
      } else {
        setShowDepart(true);
      }
    } else {
      setShowDepart(true);
    }
  };

  return (
    <div className="train-hub">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <h2>The Midnight Train</h2>
          <p style={{color:'#cfe9f9',margin:0}}><em>Between stations. Crew gathered.</em></p>
        </div>
        <HeartStateIndicator score={impactScore} />
      </div>

      {/* Crew dialogue section */}
      {dialogueNode && (
        <div className="crew-dialogue" style={{marginBottom:18,background:'rgba(155,211,255,0.03)',padding:16,borderRadius:10,border:'1px solid rgba(155,211,255,0.1)'}}>
          <div style={{fontSize:13,color:'#9bd3ff',fontWeight:600,marginBottom:8}}>
            {dialogueNode.speaker || 'Crew'}
          </div>
          <p style={{color:'#eaf6ff',margin:0,lineHeight:1.6}}>
            {dialogueNode.text}
          </p>
          {dialogueNode.contextHint && (
            <p style={{fontSize:12,color:'#7fa6c1',marginTop:10,fontStyle:'italic',margin:0}}>
              {dialogueNode.contextHint}
            </p>
          )}
          <div style={{marginTop:12}}>
            <button 
              className="primary" 
              onClick={handleContinueDialogue}
              aria-label="Continue dialogue"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Train carriage visualization */}
      <div className="carriage" style={{marginBottom:18,display:'flex',gap:12,alignItems:'center',background:'rgba(255,255,255,0.01)',padding:14,borderRadius:10,border:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="car-slot">
          <div className="avatar">You</div>
          <div style={{fontSize:13,color:'#d6eaf8'}}>Conductor</div>
        </div>
        <div className="car-slot">
          <div className="avatar muted">G</div>
          <div style={{fontSize:13,color:'#d6eaf8'}}>Gatherer</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600}}>{nextStation? nextStation.name : '—'}</div>
          <div style={{color:'#bfcbd6',fontSize:13}}>{nextStation? nextStation.tagline : ''}</div>
        </div>
      </div>

      {/* Passenger emotional context */}
      {passenger && (
        <div style={{marginBottom:18,background:'rgba(255,255,255,0.02)',padding:12,borderRadius:8,border:'1px solid rgba(155,211,255,0.05)'}}>
          <div style={{fontSize:13,color:'#cfe9f9',marginBottom:8}}><strong>Their heart carries:</strong></div>
          <div style={{color:'#d6eaf8',fontSize:14,lineHeight:1.5}}>
            <div style={{marginBottom:6}}><strong>Fear:</strong> {passenger.prompts.fear}</div>
            <div style={{marginBottom:6}}><strong>Desire:</strong> {passenger.prompts.desire}</div>
            <div><strong>Unsaid:</strong> "{passenger.prompts.unsaid}"</div>
          </div>
        </div>
      )}

      {/* Run log showing previous choices */}
      {runLog && runLog.length > 0 && (
        <div style={{marginBottom:18,fontSize:12,color:'#7fa6c1',background:'rgba(255,255,255,0.01)',padding:10,borderRadius:8}}>
          <div style={{fontWeight:600,marginBottom:6}}>Journey so far:</div>
          <div style={{fontSize:11}}>{runLog[runLog.length-1]}</div>
        </div>
      )}

      {/* Depart button */}
      {showDepart && (
        <div>
          <button 
            className="primary" 
            onClick={onDepart}
            style={{width:'100%'}}
            aria-label={`Depart for ${nextStation?.name || 'next station'}`}
          >
            Depart for {nextStation? nextStation.name : 'Station'}
          </button>
        </div>
      )}
    </div>
  );
}
