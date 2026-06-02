/* Main app */

const { useState: useStateA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "theme": "light",
  "accents": true,
  "aiProactivity": "balanced",
  "heroLayout": "grid"
}/*EDITMODE-END*/;

function App() {
  const [active, setActive] = useStateA('overview');
  const [drawerChain, setDrawerChain] = useStateA(null);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-density', tweaks.density);
    document.documentElement.setAttribute('data-accents', tweaks.accents ? 'on' : 'off');
  }, [tweaks.theme, tweaks.density, tweaks.accents]);

  return (
    <div className="app">
      <Rail active={active} setActive={setActive} />
      <main className="main">
        <Topbar now={window.DATA.NOW} />
        <div className="content">
          <div className="page-h">
            <div>
              <h1>{active === 'overview' ? 'Overview' : active === 'performance' ? 'Performance' : active === 'cost' ? 'Cost' : active === 'automations' ? 'Automations' : active === 'workspaces' ? 'Workspaces' : active === 'settings' ? 'Settings' : 'Incidents'}</h1>
              <div className="sub">
                {active === 'settings' ? <>Workspace configuration · wardn</> : <>Operations intelligence · self-hosted<span className="live">All regions</span></>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {active !== 'automations' && active !== 'workspaces' && active !== 'settings' && (
                <div className="tabs">
                <button data-on={active === 'overview' ? 'true' : 'false'} onClick={() => setActive('overview')}>Overview</button>
                <button data-on={active === 'performance' ? 'true' : 'false'} onClick={() => setActive('performance')}>Performance</button>
                <button data-on={active === 'cost' ? 'true' : 'false'} onClick={() => setActive('cost')}>Cost</button>
                <button data-on={active === 'incidents' ? 'true' : 'false'} onClick={() => setActive('incidents')}>Incidents</button>
              </div>
              )}
            </div>
          </div>

          {active === 'overview' && (
            <>
              <WhatChanged />
              <OpenAlertsStrip />
              <LinearTickets />
              <RPCVolumeRow />
              <DeploymentsRow />
              <CostRow />
            </>
          )}
          {active === 'performance' && <PerformancePage />}
          {active === 'cost' && <CostPage />}
          {active === 'incidents' && <IncidentsPage />}
          {active === 'automations' && <AutomationsPage />}
          {active === 'workspaces' && <WorkspacesPage />}
          {active === 'settings' && <SettingsPage />}
        </div>
      </main>

      <ComposerDock />
      <Drawer chainId={drawerChain} onClose={() => setDrawerChain(null)} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={tweaks.density}
                    options={['comfortable','compact','terminal']}
                    onChange={v => setTweak('density', v)} />
        <TweakRadio label="Theme" value={tweaks.theme}
                    options={['light','dark']}
                    onChange={v => setTweak('theme', v)} />
        <TweakSection label="Visual" />
        <TweakToggle label="Per-chain accent colors" value={tweaks.accents}
                     onChange={v => setTweak('accents', v)} />
        <TweakSection label="AI assistance" />
        <TweakRadio label="Proactivity" value={tweaks.aiProactivity}
                    options={['minimal','balanced','assertive']}
                    onChange={v => setTweak('aiProactivity', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
