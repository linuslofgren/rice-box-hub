%% All throughputs
close all

ref = readmatrix("ref", NumHeaderLines=1, Delimiter=';', DecimalSeparator=',');
sim = readmatrix("simulation");

ref_mags = ref(:, 2);

sim_disp = sim(:, 1)*1e3; % to mm
S21_ref = -52.4; % dB. This is simulated S21 without RIS
sim_S21 = sim(:, 2) - S21_ref;


runs = -40:1:40;

sweep_mags = [];

for n = runs
    data = readmatrix(num2str(n), NumHeaderLines=1, Delimiter=';', DecimalSeparator=',');
    freqs = data(:, 1); % All real world frequency sweep have 2.404 GHz - 2.406 GHz 100 points
    one_run_mags = data(:, 2) - ref_mags;
    sweep_mags = [sweep_mags; one_run_mags'];
end

chosen_freq_index = 1;
%three_inds = [1 size(sweep_mags, 2)/2 size(sweep_mags, 2)];
%three_mags = sweep_mags(:, three_inds);

figure();
hold on;

plot(runs, sweep_mags(:, chosen_freq_index));  % Choose the lowest frequency, remove the indexing for 3 plots
plot(sim_disp, sim_S21); % also relative the "sim background" (simply removeing s21 without ris in FEKO)

title("Relative throughput during displacement sweep");
ylabel("Log Magnitude [dB]");
xlabel("Displacement [mm]");
legend("Real world " + num2str(freqs(chosen_freq_index)/1e9) + "GHz", "Simulated S21 2.4 GHz");


%Below surface plot is just for fun
% One millimeter steps between runs
[X, Y] = meshgrid(freqs/1e9, runs);
figure();
surf(X, Y, sweep_mags);

title("Dont include this one")
xlabel("Frequency [GHz]");
ylabel("Displacement [mm]");
zlabel("Log Magnitude [dB]")



%%% RELATIVE THROUGHPUT MEANS RELATIVE NO RIS %%%


%%%%%%%%%% Min max %%%%%%%%%%
min_sweep = readmatrix("min", 'NumHeaderLines', 1, 'Delimiter', ';', 'DecimalSeparator', ',');
max_sweep = readmatrix("max", 'NumHeaderLines', 1, 'Delimiter', ';', 'DecimalSeparator', ',');

min_mags = min_sweep(:, 2) - ref_mags;
max_mags = max_sweep(:, 2) - ref_mags;

[best_throughput, best_disp] = max(sweep_mags(:, chosen_freq_index));

figure();
hold on

plot(freqs, max_mags);
plot(freqs, sweep_mags(best_disp,:));
plot(freqs, min_mags);
legend("Maximized", "Best constrained configuration at 2.404 GHz ", "Minimized");
title("Relative throughput of min and max configuration");
ylabel("Log Magnitude [dB]");
xlabel("Frequency [GHz]");


dynamic_range_free = max(max_mags) - min(min_mags);
% dynamic_range_constrained = 
disp("The dynamic range for the freely optimized configurations is " + num2str(dynamic_range_free) + " dB")


%%%%%%% Simulated far field of RIS %%%%%%%
ff = readmatrix("simulated_RIS_farfield");
figure()

polarplot(pi/180*ff(:, 1), ff(:, 2))
rlim([-50 10]);
thetalim([0 180]);
title('Scattered far field of RIS [dbV], d = 20mm');
legend('E-Field magnitude')