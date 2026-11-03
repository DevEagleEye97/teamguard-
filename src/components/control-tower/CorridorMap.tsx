import React, { useState } from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  Truck, 
  ShieldCheck, 
  Navigation, 
  ExternalLink,
  Layers,
  Clock,
  Compass
} from 'lucide-react';
import { Shipment, ClusterRegion } from '../../types';

interface CorridorMapProps {
  shipments: Shipment[];
  selectedShipmentId?: string;
  onSelectShipment: (shipment: Shipment) => void;
  selectedCluster: ClusterRegion | 'All';
}

interface HubPoint {
  id: string;
  name: string;
  cluster: ClusterRegion;
  x: number; // percentage in SVG viewBox (0-800)
  y: number; // percentage in SVG viewBox (0-850)
  role: 'Primary Assembly' | 'Secondary Plant' | 'Supplier Cluster' | 'Port Gateway';
  description: string;
}

const HUBS: HubPoint[] = [
  {
    id: 'hub-ncr',
    name: 'NCR - Manesar / Gurugram',
    cluster: 'NCR-Manesar',
    x: 370,
    y: 220,
    role: 'Supplier Cluster',
    description: 'Auto harness, sensors, stamping cluster. Connected via Western Freight Corridor.'
  },
  {
    id: 'hub-sanand',
    name: 'Gujarat - Sanand / Ahmedabad',
    cluster: 'Gujarat-Sanand',
    x: 230,
    y: 380,
    role: 'Supplier Cluster',
    description: 'Forging, precision die casting, high-tensile hardware cluster.'
  },
  {
    id: 'hub-jnpt',
    name: 'Mumbai - Nhava Sheva (JNPT)',
    cluster: 'Mumbai-JNPT',
    x: 280,
    y: 520,
    role: 'Port Gateway',
    description: 'Primary sea container port gateway; raw aluminum ingot & electronic silicon customs clearance.'
  },
  {
    id: 'hub-chakan',
    name: 'Pune - Chakan Industrial Area',
    cluster: 'Pune-Chakan',
    x: 310,
    y: 550,
    role: 'Primary Assembly',
    description: 'Apex Central Assembly Plant (Lines 1 & 2 - Powertrain & Transmission).'
  },
  {
    id: 'hub-hosur',
    name: 'Hosur - SIPCOT (TN/KA Border)',
    cluster: 'Bengaluru-Hosur',
    x: 410,
    y: 710,
    role: 'Secondary Plant',
    description: 'Apex Secondary Plant (Line 3 - Chassis & Braking Unit).'
  },
  {
    id: 'hub-blr',
    name: 'Bengaluru - Electronic City',
    cluster: 'Bengaluru-Hosur',
    x: 390,
    y: 690,
    role: 'Supplier Cluster',
    description: 'Microcircuits, speed sensors, electronic engine management units.'
  },
  {
    id: 'hub-chennai',
    name: 'Chennai - Sriperumbudur',
    cluster: 'Chennai-Sriperumbudur',
    x: 480,
    y: 700,
    role: 'Supplier Cluster',
    description: 'Hydraulic braking systems, calipers, automotive rubber components.'
  }
];

export const CorridorMap: React.FC<CorridorMapProps> = ({
  shipments,
  selectedShipmentId,
  onSelectShipment,
  selectedCluster,
}) => {
  const [activeHoverHub, setActiveHoverHub] = useState<HubPoint | null>(null);

  // Map shipment positions roughly along corridors
  const getShipmentVisualPosition = (shipment: Shipment) => {
    switch (shipment.id) {
      case 'shp-101': // JNPT to Chakan near Khopoli
        return { x: 295, y: 535, isBottleneck: true };
      case 'shp-102': // Manesar to Chakan held at Bawal border
        return { x: 350, y: 260, isBottleneck: true };
      case 'shp-103': // Bengaluru airport customs
        return { x: 400, y: 675, isBottleneck: true };
      case 'shp-104': // Sriperumbudur to Hosur near Vellore
        return { x: 445, y: 705, isBottleneck: true };
      case 'shp-105': // Sanand to Chakan near Surat
        return { x: 260, y: 440, isBottleneck: false };
      case 'shp-106': // Pune local Bhosari to Chakan
        return { x: 315, y: 565, isBottleneck: false };
      default:
        return { x: 320, y: 500, isBottleneck: false };
    }
  };

  return (
    <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4 lg:p-5 relative overflow-hidden">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              National Logistics Corridor & Disruption Map
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
              Interactive Schematic
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transit telemetry across Golden Quadrilateral & Industrial Corridors
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-red-300 font-medium">Critical Delay / Landslide</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-300">Border Check</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-300">On Track</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/10] max-h-[500px] bg-[#090D16] rounded-xl border border-slate-800/90 overflow-hidden flex items-center justify-center">
        {/* Ambient grid texture */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#3B4863 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />

        <svg 
          viewBox="0 0 800 850" 
          className="w-full h-full object-contain"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E5C07B" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="stalledGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.4" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="redGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* India Schematic Border (Subtle Silhouette Contour) */}
          <path
            d="M 330 80 
               C 350 70, 390 100, 420 130 
               C 440 150, 480 180, 520 220 
               C 560 270, 600 290, 650 310 
               C 690 330, 670 380, 630 420 
               C 590 450, 550 490, 530 540 
               C 510 590, 500 660, 480 730 
               C 460 780, 420 830, 400 840 
               C 380 840, 350 780, 330 730 
               C 300 660, 280 600, 270 540 
               C 260 480, 210 440, 190 390 
               C 170 340, 210 300, 240 260 
               C 270 220, 290 160, 310 120 Z"
            fill="none"
            stroke="#1A2333"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />

          {/* Freight Corridors (Highways) */}
          {/* Corridor 1: Delhi/Manesar -> Sanand -> Mumbai -> Pune (Western Corridor) */}
          <path
            d="M 370 220 L 230 380 L 280 520 L 310 550"
            fill="none"
            stroke="#2B364A"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 370 220 L 230 380 L 280 520 L 310 550"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            strokeOpacity="0.6"
          />

          {/* Corridor 2: Pune -> Bengaluru -> Hosur -> Chennai */}
          <path
            d="M 310 550 L 390 690 L 410 710 L 480 700"
            fill="none"
            stroke="#2B364A"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 310 550 L 390 690 L 410 710 L 480 700"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            strokeOpacity="0.6"
          />

          {/* Corridor 3: Mumbai JNPT -> Pune Chakan (Expressway with Landslide warning) */}
          <path
            d="M 280 520 Q 295 535 310 550"
            fill="none"
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeDasharray="4 3"
            filter="url(#redGlow)"
          />

          {/* Stalled Highway Segment Highlight (NH-48 Ghat) */}
          <circle cx="295" cy="535" r="14" fill="#EF4444" fillOpacity="0.2" className="animate-pulse" />
          <text x="260" y="525" fill="#FCA5A5" fontSize="10" fontWeight="bold" fontFamily="monospace">
            ⚠️ NH-48 Ghat Blocked
          </text>

          {/* Bawal Border Checkpost Alert */}
          <circle cx="350" cy="260" r="12" fill="#F59E0B" fillOpacity="0.2" />
          <text x="365" y="260" fill="#FCD34D" fontSize="9" fontWeight="bold" fontFamily="monospace">
            ⏱️ e-Way Check (37h delay)
          </text>

          {/* Render Hub Nodes */}
          {HUBS.map((hub) => {
            const isHovered = activeHoverHub?.id === hub.id;
            const isPrimary = hub.role === 'Primary Assembly';
            const isSecondary = hub.role === 'Secondary Plant';
            const isPort = hub.role === 'Port Gateway';

            return (
              <g 
                key={hub.id} 
                className="cursor-pointer group"
                onMouseEnter={() => setActiveHoverHub(hub)}
                onMouseLeave={() => setActiveHoverHub(null)}
              >
                {/* Node Halo */}
                {isPrimary ? (
                  <>
                    <circle cx={hub.x} cy={hub.y} r="18" fill="#D4AF37" fillOpacity="0.2" filter="url(#goldGlow)" />
                    <circle cx={hub.x} cy={hub.y} r="8" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="2" />
                  </>
                ) : isSecondary ? (
                  <>
                    <circle cx={hub.x} cy={hub.y} r="14" fill="#3B82F6" fillOpacity="0.25" />
                    <circle cx={hub.x} cy={hub.y} r="6" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.5" />
                  </>
                ) : isPort ? (
                  <>
                    <circle cx={hub.x} cy={hub.y} r="12" fill="#8B5CF6" fillOpacity="0.25" />
                    <circle cx={hub.x} cy={hub.y} r="5" fill="#A78BFA" stroke="#FFFFFF" strokeWidth="1.5" />
                  </>
                ) : (
                  <>
                    <circle cx={hub.x} cy={hub.y} r="10" fill="#374151" fillOpacity="0.4" />
                    <circle cx={hub.x} cy={hub.y} r="4.5" fill="#9CA3AF" stroke="#1F2937" strokeWidth="1.5" />
                  </>
                )}

                {/* Hub label */}
                <text
                  x={hub.x + 12}
                  y={hub.y + 4}
                  fill={isPrimary ? '#FCD34D' : isSecondary ? '#93C5FD' : '#E5E7EB'}
                  fontSize={isPrimary ? "12" : "10"}
                  fontWeight={isPrimary ? "bold" : "600"}
                  className="select-none drop-shadow"
                >
                  {hub.name}
                </text>
              </g>
            );
          })}

          {/* Render Active Shipments along Corridors */}
          {shipments.map((shipment) => {
            const pos = getShipmentVisualPosition(shipment);
            const isSelected = selectedShipmentId === shipment.id;
            const isDelayed = shipment.status === 'delayed' || shipment.status === 'critical_risk';

            const fillColor = shipment.status === 'critical_risk' 
              ? '#EF4444' 
              : shipment.status === 'delayed' 
              ? '#F59E0B' 
              : '#10B981';

            return (
              <g
                key={shipment.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => onSelectShipment(shipment)}
              >
                {/* Ping animation for delayed items */}
                {isDelayed && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "14" : "10"}
                    fill={fillColor}
                    fillOpacity="0.4"
                    className="animate-ping"
                  />
                )}

                {/* Marker ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? "8" : "6"}
                  fill={fillColor}
                  stroke="#0B0F17"
                  strokeWidth="2"
                  filter={isDelayed ? "url(#redGlow)" : undefined}
                />

                {/* Shipment mini-label */}
                <text
                  x={pos.x + 8}
                  y={pos.y - 6}
                  fill={isDelayed ? '#FCA5A5' : '#D1D5DB'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {shipment.trackingNumber.split('-')[2]} ({shipment.delayHours > 0 ? `+${shipment.delayHours}h` : 'OK'})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Hub Tooltip Card */}
        {activeHoverHub && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-[#111726]/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 shadow-2xl text-xs z-10">
            <div className="flex items-center justify-between text-amber-300 font-semibold mb-1">
              <span>{activeHoverHub.name}</span>
              <span className="text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                {activeHoverHub.role}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {activeHoverHub.description}
            </p>
          </div>
        )}
      </div>

      {/* Corridors quick stats banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800/80">
        <div className="bg-[#121824] rounded-xl p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Primary Delivery Route</div>
          <div className="text-xs font-semibold text-white mt-0.5">NH-48 Golden Quadrilateral</div>
          <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Khandala Ghat: Slow Movement</span>
          </div>
        </div>

        <div className="bg-[#121824] rounded-xl p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Western Freight Corridor</div>
          <div className="text-xs font-semibold text-white mt-0.5">NCR to Maharashtra</div>
          <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>e-Way Check: Avg +18h Delay</span>
          </div>
        </div>

        <div className="bg-[#121824] rounded-xl p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Southern Industrial Spine</div>
          <div className="text-xs font-semibold text-white mt-0.5">Chennai - Hosur - BLR</div>
          <div className="text-[10px] text-orange-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Vellore Detour Active</span>
          </div>
        </div>

        <div className="bg-[#121824] rounded-xl p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Intra-Cluster Pune Feeder</div>
          <div className="text-xs font-semibold text-white mt-0.5">Bhosari & Chakan Hubs</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Normal Green Transit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
