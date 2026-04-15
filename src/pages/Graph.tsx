import React, { useEffect, useState, useRef } from 'react';
import { Share2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import GlassCard from '../components/GlassCard';

export default function Graph() {
  const [data, setData] = useState<any>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const nodes = [
        { id: 'core', name: 'Neurolink Core', val: 20, color: '#5C38FF' },
        ...tasks.map((t: any) => ({
          id: t.id,
          name: t.text,
          val: 10,
          color: t.done ? '#00F0FF' : '#334155',
          done: t.done
        }))
      ];

      const links = tasks.map((t: any) => ({
        source: 'core',
        target: t.id
      }));

      setData({ nodes, links });
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Share2 className="text-cosmic-indigo" />
            Knowledge Constellation
          </h1>
          <p className="text-white/60">Visualize your tasks as a neural network. Glowing nodes represent completed mastery.</p>
        </div>
      </header>

      <GlassCard className="flex-1 p-0 overflow-hidden relative" hover={false}>
        <div ref={containerRef} className="w-full h-full">
          {!loading && (
            <ForceGraph2D
              graphData={data}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="rgba(0,0,0,0)"
              nodeLabel="name"
              nodeRelSize={6}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Inter`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                // Draw node circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color;
                if (node.done) {
                  ctx.shadowBlur = 15;
                  ctx.shadowColor = '#00F0FF';
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw label
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillText(label, node.x, node.y + 10);
              }}
              linkColor={() => 'rgba(255, 255, 255, 0.05)'}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleColor={() => '#5C38FF'}
              d3VelocityDecay={0.3}
            />
          )}
        </div>

        <div className="absolute bottom-8 right-8 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">
            <div className="w-3 h-3 rounded-full bg-cosmic-indigo shadow-[0_0_10px_#5C38FF]" />
            Core
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">
            <div className="w-3 h-3 rounded-full bg-cosmic-cyan shadow-[0_0_10px_#00F0FF]" />
            Mastered
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            Pending
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
