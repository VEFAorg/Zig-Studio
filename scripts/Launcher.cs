using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;

namespace ZigStudio {
    public class SetupForm : Form {
        private TextBox txtPort;
        private ComboBox cmbHost;
        private TextBox txtZigPath;
        private TextBox txtZlsPath;
        private CheckBox chkAutoStartBridge;
        private CheckBox chkCreateShortcut;

        public SetupForm() {
            this.Text = "⚡ Zig Studio — DevOps Setup Wizard (v0.3.1)";
            this.Size = new Size(580, 480);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(15, 17, 21);
            this.ForeColor = Color.FromArgb(226, 232, 240);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            TableLayoutPanel layout = new TableLayoutPanel {
                Dock = DockStyle.Fill,
                Padding = new Padding(24),
                RowCount = 8,
                ColumnCount = 3
            };

            // Title Header
            Label lblTitle = new Label {
                Text = "⚡ Zig Studio DevOps Configuration",
                Font = new Font("Segoe UI", 14f, FontStyle.Bold),
                ForeColor = Color.FromArgb(247, 164, 29), // Zig Orange
                AutoSize = true
            };
            layout.SetColumnSpan(lblTitle, 3);
            layout.Controls.Add(lblTitle);

            Label lblSubtitle = new Label {
                Text = "Configure your systems environment, network binding, and toolchains without terminal commands.",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                AutoSize = true,
                Margin = new Padding(0, 0, 0, 16)
            };
            layout.SetColumnSpan(lblSubtitle, 3);
            layout.Controls.Add(lblSubtitle);

            // Port
            Label lblPort = new Label { Text = "WebSocket Bridge Port:", AutoSize = true, Anchor = AnchorStyles.Left };
            txtPort = new TextBox { Text = "9999", BackColor = Color.FromArgb(26, 30, 40), ForeColor = Color.White, Width = 100 };
            layout.Controls.Add(lblPort);
            layout.Controls.Add(txtPort);
            layout.Controls.Add(new Label { Text = "(Default: 9999)", ForeColor = Color.FromArgb(100, 116, 139), AutoSize = true });

            // Host
            Label lblHost = new Label { Text = "Network Host Binding:", AutoSize = true, Anchor = AnchorStyles.Left };
            cmbHost = new ComboBox {
                BackColor = Color.FromArgb(26, 30, 40),
                ForeColor = Color.White,
                DropDownStyle = ComboBoxStyle.DropDownList,
                Width = 200
            };
            cmbHost.Items.Add("127.0.0.1 (Local Only)");
            cmbHost.Items.Add("0.0.0.0 (Container / Docker / Remote)");
            cmbHost.SelectedIndex = 0;
            layout.Controls.Add(lblHost);
            layout.Controls.Add(cmbHost);
            layout.Controls.Add(new Label { Text = "(Use 0.0.0.0 for Docker)", ForeColor = Color.FromArgb(100, 116, 139), AutoSize = true });

            // Zig Path
            Label lblZig = new Label { Text = "Zig Compiler Path:", AutoSize = true, Anchor = AnchorStyles.Left };
            txtZigPath = new TextBox { Text = "zig", BackColor = Color.FromArgb(26, 30, 40), ForeColor = Color.White, Width = 200 };
            Button btnBrowseZig = new Button {
                Text = "Browse...",
                BackColor = Color.FromArgb(45, 55, 72),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnBrowseZig.Click += (s, e) => {
                using (OpenFileDialog ofd = new OpenFileDialog { Filter = "Zig Executable (zig.exe)|zig.exe|All Files (*.*)|*.*" }) {
                    if (ofd.ShowDialog() == DialogResult.OK) txtZigPath.Text = ofd.FileName;
                }
            };
            layout.Controls.Add(lblZig);
            layout.Controls.Add(txtZigPath);
            layout.Controls.Add(btnBrowseZig);

            // ZLS Path
            Label lblZls = new Label { Text = "ZLS Binary Path:", AutoSize = true, Anchor = AnchorStyles.Left };
            txtZlsPath = new TextBox { Text = "zls", BackColor = Color.FromArgb(26, 30, 40), ForeColor = Color.White, Width = 200 };
            Button btnBrowseZls = new Button {
                Text = "Browse...",
                BackColor = Color.FromArgb(45, 55, 72),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnBrowseZls.Click += (s, e) => {
                using (OpenFileDialog ofd = new OpenFileDialog { Filter = "ZLS Executable (zls.exe)|zls.exe|All Files (*.*)|*.*" }) {
                    if (ofd.ShowDialog() == DialogResult.OK) txtZlsPath.Text = ofd.FileName;
                }
            };
            layout.Controls.Add(lblZls);
            layout.Controls.Add(txtZlsPath);
            layout.Controls.Add(btnBrowseZls);

            // Checkboxes
            chkAutoStartBridge = new CheckBox {
                Text = "Auto-start RFC 6455 WebSocket ZLS Bridge Daemon",
                Checked = true,
                ForeColor = Color.FromArgb(203, 213, 225),
                AutoSize = true
            };
            layout.SetColumnSpan(chkAutoStartBridge, 3);
            layout.Controls.Add(chkAutoStartBridge);

            chkCreateShortcut = new CheckBox {
                Text = "Create Desktop Shortcut for 1-click launch",
                Checked = true,
                ForeColor = Color.FromArgb(203, 213, 225),
                AutoSize = true
            };
            layout.SetColumnSpan(chkCreateShortcut, 3);
            layout.Controls.Add(chkCreateShortcut);

            // Actions panel
            FlowLayoutPanel actions = new FlowLayoutPanel {
                FlowDirection = FlowDirection.RightToLeft,
                Dock = DockStyle.Fill,
                Margin = new Padding(0, 16, 0, 0)
            };

            Button btnLaunch = new Button {
                Text = "⚡ Save & Launch Zig Studio",
                BackColor = Color.FromArgb(247, 164, 29),
                ForeColor = Color.Black,
                Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                FlatStyle = FlatStyle.Flat,
                Height = 40,
                Width = 230,
                Cursor = Cursors.Hand
            };
            btnLaunch.Click += (s, e) => SaveAndLaunch();

            Button btnCancel = new Button {
                Text = "Cancel",
                BackColor = Color.FromArgb(30, 41, 59),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Height = 40,
                Width = 90
            };
            btnCancel.Click += (s, e) => this.Close();

            actions.Controls.Add(btnLaunch);
            actions.Controls.Add(btnCancel);
            layout.SetColumnSpan(actions, 3);
            layout.Controls.Add(actions);

            this.Controls.Add(layout);
        }

        private void SaveAndLaunch() {
            try {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string configPath = Path.Combine(baseDir, "zig-studio.json");

                string hostStr = cmbHost.SelectedIndex == 1 ? "0.0.0.0" : "127.0.0.1";
                string json = string.Format(
                    "{{\n  \"port\": {0},\n  \"host\": \"{1}\",\n  \"zigPath\": \"{2}\",\n  \"zlsPath\": \"{3}\",\n  \"autoStartBridge\": {4}\n}}",
                    txtPort.Text.Trim(),
                    hostStr,
                    txtZigPath.Text.Replace("\\", "\\\\"),
                    txtZlsPath.Text.Replace("\\", "\\\\"),
                    chkAutoStartBridge.Checked ? "true" : "false"
                );

                File.WriteAllText(configPath, json, Encoding.UTF8);

                if (chkCreateShortcut.Checked) {
                    CreateDesktopShortcut();
                }

                Program.LaunchIDE(baseDir, int.Parse(txtPort.Text.Trim()), chkAutoStartBridge.Checked);
                this.Close();
            } catch (Exception ex) {
                MessageBox.Show("Configuration Error: " + ex.Message, "Zig Studio Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void CreateDesktopShortcut() {
            try {
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string shortcutPath = Path.Combine(desktop, "Zig Studio.url");
                string exePath = Application.ExecutablePath;
                using (StreamWriter writer = new StreamWriter(shortcutPath)) {
                    writer.WriteLine("[InternetShortcut]");
                    writer.WriteLine("URL=file:///" + Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "index.html").Replace("\\", "/"));
                    writer.WriteLine("IconIndex=0");
                    writer.WriteLine("IconFile=" + exePath);
                }
            } catch {}
        }
    }

    static class Program {
        [STAThread]
        static void Main(string[] args) {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool forceSetup = false;
            string exeName = Path.GetFileNameWithoutExtension(Application.ExecutablePath).ToLower();
            if (exeName.Contains("setup") || (args.Length > 0 && (args[0] == "--setup" || args[0] == "-s"))) {
                forceSetup = true;
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string configPath = Path.Combine(baseDir, "zig-studio.json");

            if (forceSetup || !File.Exists(configPath)) {
                Application.Run(new SetupForm());
            } else {
                int port = 9999;
                bool autoBridge = true;
                try {
                    string content = File.ReadAllText(configPath);
                    if (content.Contains("\"port\":")) {
                        int pIdx = content.IndexOf("\"port\":") + 7;
                        int endIdx = content.IndexOfAny(new char[] { ',', '\n', '}' }, pIdx);
                        if (endIdx > pIdx) int.TryParse(content.Substring(pIdx, endIdx - pIdx).Trim(), out port);
                    }
                } catch {}
                LaunchIDE(baseDir, port, autoBridge);
            }
        }

        public static void LaunchIDE(string baseDir, int port, bool autoStartBridge) {
            string htmlPath = Path.Combine(baseDir, "index.html");
            string bridgeScript = Path.Combine(baseDir, "zls_bridge.js");

            if (autoStartBridge && File.Exists(bridgeScript)) {
                try {
                    ProcessStartInfo psi = new ProcessStartInfo {
                        FileName = "node",
                        Arguments = "\"" + bridgeScript + "\" --port " + port,
                        WorkingDirectory = baseDir,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                    Process.Start(psi);
                } catch {}
            }

            if (File.Exists(htmlPath)) {
                Process.Start(new ProcessStartInfo {
                    FileName = htmlPath,
                    UseShellExecute = true
                });
            }
        }
    }
}
